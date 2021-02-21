import asyncio
from datetime import datetime
from typing import List, Union

from app.common import SkipListing
from app.scrapers.base import BaseScraper


class BaljonScraper(BaseScraper):
    MAKELAARDIJ: str = "baljon"
    BASE_URL: str = "https://www.baljonmakelaars.nl"

    # Specific functions
    async def extract_object_urls(self, soup) -> List[str]:
        """
        Extract apartment object urls
        """
        urls: List[str] = []

        items = soup.find_all("a")
        for item in items:
            item_url = item.get("href")
            if item_url and "/woning/" in item_url:
                urls.append(item_url)
        return urls

    async def get_page_url(self, page_num: int) -> str:
        """
        Format page url
        """
        return f"{self.BASE_URL}/woningen/koop/page/{page_num}/"

    async def get_apartment_urls(self) -> List[str]:
        """
        Fetch list of apartment urls from inventory
        """
        urls: List[str] = []
        page_limit = 5
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
        """
        meta_data = {
            "makelaardij": self.MAKELAARDIJ,
            "building": {},
            "unit": {"energy": {}, "tags": []},
            "photos": [],
        }

        overview = soup.find("div", {"class": "objectintro"})

        # Basics
        meta_data["address"] = overview.find("h3").text.split("\n")[1].strip()

        status = overview.find("div", {"class": "status"})
        meta_data["available"] = status is None or (
            status and "verkocht" not in status.text.lower()
        )

        basic_info = overview.find("div", {"class": "objectdata"})
        try:
            meta_data["asking_price"] = self.find_int(
                basic_info.find("div", {"class": "top"}).find("div").text
            )
        except ValueError:
            raise SkipListing("Unable to find price")

        names = []
        for line in basic_info.find("div", {"class": "left"}).text.split("\n"):
            if n := line.strip():
                names.append(n.replace(":", ""))

        values = [
            v.text.replace("\n", "").strip()
            for v in basic_info.find("div", {"class": "right"}).find_all("div")
        ]

        for n, v in zip(names, values):

            if "niet bekend" in v.lower():
                continue
            elif "Bouwjaar" in n:
                meta_data["building"]["year_constructed"] = self.find_int(v)
            elif "Woonoppervlak" in n:
                meta_data["unit"]["area"] = self.find_float(v.split("m")[0])
            elif "Kamers" in n:
                meta_data["unit"]["num_rooms"] = self.find_int(v)

        # Description
        description = (
            soup.find("section", {"class": "objectcontent"}).find("article").text
        )

        if "balkon" in description:
            meta_data["unit"]["tags"].append("balcony")

        if "dakterras" in description:
            meta_data["unit"]["tags"].append("roof_terrace")

        if "achtertuin" in description or "voortuin" in description:
            meta_data["unit"]["tags"].append("garden")

        if "eigen grond" in description:
            meta_data["unit"]["own_land"] = True
        elif "erfpacht" in description:
            meta_data["unit"]["own_land"] = False

        try:
            label_ind = description.index("Energielabel") + len("Energielabel") + 1
            meta_data["unit"]["energy"]["label"] = description[
                label_ind : label_ind + 1
            ]
        except ValueError:
            pass

        # Bounce broken listings
        if not meta_data["unit"].get("area"):
            raise SkipListing("Unable to find area")
        elif "asking_price" in meta_data and meta_data["asking_price"] < 10000:
            raise SkipListing("Rental property")

        return meta_data


if __name__ == "__main__":
    scraper = BaljonScraper()

    loop = asyncio.get_event_loop()
    loop.run_until_complete(scraper.start())
