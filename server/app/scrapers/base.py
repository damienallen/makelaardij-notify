import asyncio
import re
from datetime import datetime
from random import randint
from time import sleep
from typing import List, Union
from pydantic.error_wrappers import ValidationError as PydanticError

import httpx
from app.common import MissingListing, SkipListing
from app.broadcast import broadcast_apartment
from app.models import Apartment
from bs4 import BeautifulSoup
from odmantic import AIOEngine


engine = AIOEngine(database="aanbod")


class BaseScraper:

    MAKELAARDIJ: str = ""
    BASE_URL: str = ""
    QUERY: str = ""

    WAIT: int = 2
    JITTER: int = 1

    async def start(self, update_existing: bool = False, debug_mode: bool = False):
        apartment_urls = await self.get_apartment_urls()
        self.print_header(f"| Scraped {len(apartment_urls)} listings")
        if debug_mode:
            apartment_urls = [apartment_urls[0]]

        for url in apartment_urls:
            listing = await engine.find_one(Apartment, Apartment.url == f"{url}")

            # Skip existing if not outdated
            if listing and not update_existing and not debug_mode:
                continue

            # Otherwise scrape
            try:
                listing_data = await self.scrape_item(url)
                apartment = Apartment.parse_obj(listing_data)

            except SkipListing:
                continue

            except (MissingListing, PydanticError) as e:
                print(f"\n{url}")
                print(f"{e}\n")
                continue

            # Create or update DB entry
            if debug_mode:
                self.print_header(f"+ {apartment.address}")
                print(listing_data)

                await broadcast_apartment(apartment)

            elif listing is None:
                self.print_header(f"+ {apartment.address}")
                await engine.save(apartment)
                await broadcast_apartment(apartment)

            else:
                listing.asking_price = apartment.asking_price
                listing.photos = apartment.photos
                listing.available = apartment.available
                listing.unit = apartment.unit
                listing.building = apartment.building
                listing.entry_updated = datetime.utcnow()

                await engine.save(listing)

            self.sleep_interval()

    # Generic functions

    async def scrape_page(self, page_num: int) -> List[str]:
        url = await self.get_page_url(page_num)

        async with httpx.AsyncClient() as client:
            result = await client.get(url)

        # Check for good status
        if result.status_code == 404:
            # TODO: console message
            return []
        elif not result.status_code == 200:
            print(f"Error: {result}")
            return []

        # Extract HTML
        soup = BeautifulSoup(result.content, "html.parser")

        # Extract apartment object urls
        urls = await self.extract_object_urls(soup)

        return list(set(urls))

    async def scrape_item(self, item_url: str):
        async with httpx.AsyncClient() as client:
            result = await client.get(item_url)

        # Check for good status
        if result.status_code == 404:
            raise MissingListing(f"[404] not found: {item_url}")
        if not result.status_code == 200:
            raise Exception(f"[{result.status_code}] {result}")

        # Extract HTML
        soup = BeautifulSoup(result.content, "html.parser")

        item_data = self.extract_features(soup)
        item_data["url"] = item_url

        return item_data

    # Specific functions
    @staticmethod
    async def extract_object_urls(soup) -> str:
        """
        Extract apartment object urls
        [OVERRIDE]
        """
        urls = []

        items = soup.find_all("a", {"class": ["action-button", "white"]})
        for item in items:
            if "/woningaanbod/" in item.get("href"):
                urls.append(item["href"])

        return urls

    async def get_page_url(self, page_num: int) -> str:
        """
        Format page url
        [OVERRIDE]
        """
        return f"{self.BASE_URL}/page/{page_num}/{self.QUERY}"

    async def get_apartment_urls(self) -> List[str]:
        """
        Fetch list of apartment urls from inventory
        [OVERRIDE]
        """
        urls = []
        page_limit = 20
        page_index = 1

        while page_index <= page_limit:
            index_urls = await self.scrape_page(page_index)
            if index_urls:
                urls += index_urls
                self.sleep_interval()
            else:
                break
            page_index += 1

        return urls

    def extract_features(self, soup):
        """
        Extract feature metadata from listing
        [OVERRIDE]
        """
        meta_data = {
            "makelaardij": self.MAKELAARDIJ,
            "building": {},
            "unit": {"energy": {}, "tags": []},
            "photos": [],
        }
        main_content = soup.find("div", {"class": "woning"})
        summary = main_content.find_all("div", {"class": "container"})[1]

        # Basics
        basic_info = summary.find("div", {"class": "col"})
        meta_data["address"] = basic_info.find("h1").text.split(" | ")[0]
        meta_data["asking_price"] = self.find_int(
            basic_info.find("p", {"class": "price"}).text
        )
        meta_data["available"] = (
            basic_info.find("div", {"class": "new-house"}).text == "Beschikbaar"
        )

        # Description
        description = summary.find("div", {"class": "omschrijving"}).text.lower()

        if "balkon" in description:
            meta_data["unit"]["tags"].append("balcony")

        if "dakterras" in description:
            meta_data["unit"]["tags"].append("roof_terrace")

        if "eigen grond" in description:
            meta_data["unit"]["own_land"] = True

        elif "erfpacht" in description:
            meta_data["unit"]["own_land"] = False

        # Features
        feature_items = (
            main_content.find("div", {"class": "characteristics"})
            .find("div", {"class": "container"})
            .find("div", {"class": "row"})
            .find_all("li")
        )

        for feature in feature_items:
            label = feature.find("label").text
            value = feature.find("span").text

            if label == "Constructie jaar":
                meta_data["building"]["year_constructed"] = self.find_int(value)

            elif label == "Geplaatst op":
                meta_data["added"] = self.find_date(value)

            elif label == "Laatste gewijzigd op":
                meta_data["updated"] = self.find_date(value)

            elif label == "Woonruimte":
                meta_data["unit"]["area"] = self.find_float(value.split("m")[0])

            elif label == "Dak":
                meta_data["building"]["roof_type"] = value

            elif label == "Verwarming":
                meta_data["unit"]["energy"]["heating"] = value

            elif label == "Warm water":
                meta_data["unit"]["energy"]["water"] = value

            elif label == "Aantal kamers":
                meta_data["unit"]["num_rooms"] = self.find_int(value)

            elif label == "Tuin":
                if "achtertuin" in value or "voortuin" in value:
                    meta_data["unit"]["tags"].append("garden")

        # Bounce broken listings
        if not meta_data["unit"].get("area"):
            raise SkipListing("Unable to find area")

        return meta_data

    @staticmethod
    def find_date(date_str: Union[str, None]) -> Union[datetime, None]:
        """
        Parse date string
        [OVERRIDE]
        """
        if not date_str:
            return None

        date = date_str.split("-")
        return datetime(year=int(date[2]), month=int(date[1]), day=int(date[0]))

    # Helper functions
    def print_header(self, message: str):
        makelaardij_padded = "{:<12}".format(self.MAKELAARDIJ)
        print(
            f"[{datetime.now().isoformat(' ', 'seconds')}] {makelaardij_padded}{message}",
        )

    @staticmethod
    def find_int(value: str) -> int:
        return int(re.sub(r"[^0-9]", "", value)) if value is not None else None

    @staticmethod
    def find_float(value: str) -> float:
        return (
            float(re.sub(r"[^0-9.,]", "", value).replace(",", "."))
            if value is not None
            else None
        )

    def sleep_interval(self):
        """
        Sleep for jittered interval
        """
        sleep(self.WAIT + randint(-self.JITTER * 10, self.JITTER * 10) / 10)


if __name__ == "__main__":
    scraper = BaseScraper()
    scraper.BASE_URL = "https://www.voorberg.nl"
    scraper.QUERY = "?s=Rotterdam&min-koop=0&max-koop=2000000&min-huur=0&max-huur=5000&rooms=nvt&opp=nvt&post_type=properties&koop_huur=koop"
    scraper.MAKELAARDIJ = "voorberg"

    loop = asyncio.get_event_loop()
    loop.run_until_complete(scraper.start(debug_mode=True))
