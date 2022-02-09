import asyncio
from datetime import datetime
from typing import List, Union

from app.common import SkipListing
from app.scrapers.base import BaseScraper

months_nl = {
    "januari": 1,
    "februari": 2,
    "maart": 3,
    "april": 4,
    "mei": 5,
    "juni": 6,
    "juli": 7,
    "augustus": 8,
    "september": 9,
    "oktober": 10,
    "november": 11,
    "december": 12,
}


class BlijdorpScraper(BaseScraper):
    MAKELAARDIJ: str = "blijdorp"
    BASE_URL: str = "https://www.blijdorpmakelaardij.nl"

    # Specific functions
    async def extract_object_urls(self, soup) -> List[str]:
        """
        Extract apartment object urls
        """
        urls: List[str] = []

        items = soup.find_all("a", {"class": "object_data_container"})
        for item in items:
            item_url = item["href"].split("?")[0]
            urls.append(self.BASE_URL + item_url)

        return urls

    async def get_page_url(self, page_num: int) -> str:
        """
        Format page url
        """
        return f"{self.BASE_URL}/woningaanbod/koop/rotterdam?skip={page_num*10}"

    async def get_apartment_urls(self) -> List[str]:
        """
        Fetch list of apartment urls from inventory
        """
        urls: List[str] = []
        skip_limit = 10
        skip_index = 0

        while skip_index < skip_limit:
            index_urls = await self.scrape_page(skip_index)
            if index_urls:
                urls += index_urls
                self.sleep_interval()
            else:
                break
            skip_index += 1

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

        # Address
        address = soup.find("h1", {"class": "obj_address"})
        if address:
            address_str = (
                address.string.split(": ")[1]
                if ": " in address.string
                else address.string
            ).split(",")
        meta_data["address"] = address_str[0]

        # Photos
        photos = soup.find_all("img", {"class": "content"})
        photo_urls: List[str] = []
        for photo in photos:
            photo_urls.append(photo["src"])
        meta_data["photos"] = photo_urls

        # Loop through features
        features = soup.find_all("div", {"class": ["table-responsive", "feautures"]})
        raw_data = {}
        for section in features:
            table_rows = section.find_all("tr")
            for row in table_rows:
                row_data = row.find_all("td")
                if len(row_data) > 1:
                    raw_data[row_data[0].string] = row_data[1].string

        meta_data["added"] = self.find_date(raw_data.get("Aangeboden sinds"))
        meta_data["updated"] = self.find_date(raw_data.get("Laatste wijziging"))
        meta_data["asking_price"] = self.find_int(raw_data["Vraagprijs"])
        meta_data["available"] = (
            "Status" not in raw_data or raw_data.get("Status") == "Nieuw in verkoop"
        )

        meta_data["unit"]["area"] = self.find_float(
            raw_data["Gebruiksoppervlakte wonen"]
        )
        meta_data["unit"]["volume"] = self.find_float(raw_data["Inhoud"])
        meta_data["unit"]["vve_cost"] = self.find_float(raw_data.get("Servicekosten"))
        meta_data["unit"]["own_land"] = (
            raw_data["Eigendom"] == "Eigendom" if raw_data.get("Eigendom") else None
        )

        if num_bathrooms := raw_data.get("Aantal badkamers"):
            meta_data["unit"]["num_bathrooms"] = self.find_int(num_bathrooms)
        meta_data["unit"]["energy"] = {
            "heating": raw_data.get("Verwarmingssysteem"),
            "water": raw_data.get("Warm water"),
            "label": raw_data.get("Energielabel"),
        }

        meta_data["unit"]["tags"] = self.find_tags(raw_data)

        meta_data["building"] = {
            "year_constructed": int(raw_data["Bouwperiode"]),
            "building_type": raw_data.get("Soort bouw"),
            "roof_type": raw_data.get("Type dak"),
            "roof_material": raw_data.get("Dakbedekking"),
            "parking": raw_data.get("Parkeergelegenheid"),
        }

        # Harder to extract items
        if (rooms_str := raw_data.get("Aantal kamers")) is not None:
            meta_data["unit"]["num_rooms"] = int(rooms_str.split(" ")[0])

        if "Woonlaag" in raw_data and "e woonlaag" in raw_data["Woonlaag"]:
            meta_data["building"]["num_floors"] = int(
                raw_data["Woonlaag"].split("e")[0]
            )

        # Bounce broken listings
        if not meta_data["unit"].get("area"):
            raise SkipListing("Unable to find area")

        return meta_data

    @staticmethod
    def find_date(date_str: Union[str, None]) -> Union[datetime, None]:
        if not date_str:
            return None

        date = date_str.split(" ")
        return datetime(
            year=int(date[3]), month=months_nl[date[2].lower()], day=int(date[1])
        )

    @staticmethod
    def find_tags(raw_data) -> List[str]:
        tags = []
        if raw_data.get("Tuin aanwezig") == "Ja":
            tags.append("garden")
        if raw_data.get("Heeft schuur/berging") == "Ja":
            tags.append("shed")
        if raw_data.get("Opstal verzekering") == "Ja":
            tags.append("theft_insurance")
        if raw_data.get("Heeft een lift") == "Ja":
            tags.append("lift")
        return tags


if __name__ == "__main__":
    scraper = BlijdorpScraper()

    loop = asyncio.get_event_loop()
    loop.run_until_complete(scraper.start())
