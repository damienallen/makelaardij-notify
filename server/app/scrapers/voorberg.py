import asyncio
from datetime import datetime
from typing import List, Union
from app.common import SkipListing
from app.scrapers.base import BaseScraper
from odmantic import AIOEngine


engine = AIOEngine(database="aanbod")


class VoorbergScraper(BaseScraper):
    MAKELAARDIJ: str = "voorberg"
    BASE_URL: str = "https://www.voorberg.nl"
    QUERY: str = "?s=Rotterdam&min-koop=0&max-koop=2000000&min-huur=0&max-huur=5000&rooms=nvt&opp=nvt&post_type=properties&koop_huur=koop"

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


if __name__ == "__main__":
    scraper = VoorbergScraper()

    loop = asyncio.get_event_loop()
    loop.run_until_complete(scraper.start())
