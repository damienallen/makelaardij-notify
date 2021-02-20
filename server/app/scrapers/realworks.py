import asyncio
from typing import List

from app.common import SkipListing
from app.scrapers.base import BaseScraper


class RealWorksScraper(BaseScraper):

    MAKELAARDIJ: str = "vankleef"
    BASE_URL: str = "https://www.vankleefmakelaars.nl"
    ITEM_COUNT: int = 80

    # Specific functions
    async def extract_object_urls(self, soup) -> str:
        """
        Extract apartment object urls
        """
        items = soup.find_all("a")
        urls = []
        for item in items:
            item_url = item.get("href")
            if item_url and "koop/huis-" in item_url:
                urls.append(f"{self.BASE_URL}{item_url}")

        return list(set(urls))

    async def get_page_url(self, page_num: int) -> str:
        """
        Format page url
        """
        return f"{self.BASE_URL}/aanbod/woningaanbod/ROTTERDAM/100000+/koop/aantal-{self.ITEM_COUNT}/"

    async def get_apartment_urls(self) -> List[str]:
        """
        Fetch list of apartment urls from inventory
        """
        urls = await self.scrape_page(0)
        return urls

    def extract_features(self, soup):
        """
        Extract feature metadata from listing
        """
        meta_data = {
            "makelaardij": self.MAKELAARDIJ,
            "building": {},
            "unit": {"energy": {}, "tags": []},
        }

        features = soup.find("div", {"id": "Kenmerken"}).find_all(
            "span", {"class": "kenmerk"}
        )

        # Features
        for f in features:
            name = f.find("span", {"class": "kenmerkName"})
            value = f.find("span", {"class": "kenmerkValue"})

            if name is None or value is None:
                continue

            if (
                "Vraagprijs" in name.text
                or "Koopsom" in name.text
                or "Prijs" in name.text
            ):
                meta_data["asking_price"] = self.find_int(value.text)

            elif "Bouwjaar" in name.text and not "n.v.t." in value.text:
                meta_data["building"]["year_constructed"] = self.find_int(value.text)

            elif "Woonoppervlakte" in name.text:
                meta_data["unit"]["area"] = self.find_float(value.text.split(" ")[0])

            elif "Aantal kamers" in name.text:
                meta_data["unit"]["num_rooms"] = self.find_int(value.text)

            elif "Aantal woonlagen" in name.text:
                meta_data["unit"]["num_floors"] = self.find_int(value.text)

            elif "Status" in name.text:
                meta_data["available"] = "Beschikbaar" in value.text

            elif "Energieklasse" in name.text:
                meta_data["unit"]["energy"]["label"] = value.text.strip()

            elif "Soort dak" in name.text:
                meta_data["building"]["roof_type"] = value.text.strip()

            elif "Eigendomssituatie" in name.text:
                if "Volle eigendom" in value.text:
                    meta_data["unit"]["own_land"] = True
                elif "Erfpacht " in value.text:
                    meta_data["unit"]["own_land"] = False

            elif "Tuin" in name.text and (
                "achtertuin" in value.text.lower() or "voortuin" in value.text.lower()
            ):
                meta_data["unit"]["tags"].append("garden")

        # Other fields
        meta_data["address"] = soup.find("h1", {"class": "street-address"}).string

        description = soup.find("div", {"id": "Omschrijving"}).text.lower()

        if "dakterras" in description:
            meta_data["unit"]["tags"].append("roof_terrace")

        if "balkon" in description:
            meta_data["unit"]["tags"].append("balcony")

        # Bounce broken listings
        if not meta_data["unit"].get("area"):
            raise SkipListing("Unable to find area")

        return meta_data


if __name__ == "__main__":
    scraper = RealWorksScraper()

    loop = asyncio.get_event_loop()
    loop.run_until_complete(scraper.start(debug_mode=True))
