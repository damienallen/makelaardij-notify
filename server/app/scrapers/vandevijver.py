import asyncio
import re
from typing import List

from app.common import SkipListing
from app.scrapers.base import BaseScraper


class VandevijverScraper(BaseScraper):

    MAKELAARDIJ: str = "vandevijver"
    BASE_URL: str = "https://vandevijvermakelaardij.nl"

    # Specific functions
    async def extract_object_urls(self, soup) -> List[str]:
        """
        Extract apartment object urls
        """
        items = soup.find_all("a", {"class": "portfolio-box-inner"})
        urls = []
        for item in items:
            if "/woning/" in item.get("href"):
                urls.append(item["href"])

        return list(set(urls))

    async def get_page_url(self, page_num: int) -> str:
        """
        Format page url
        """
        return f"{self.BASE_URL}/woningen/te-koop/"

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
            "available": True,
            "photos": [],
        }

        features = soup.find("div", {"class": "woning-title"})

        # Basics
        meta_data["address"] = features.find("h1").text

        meta = features.find_all("h5")
        if not len(meta) > 2:
            raise SkipListing("Parking spot")

        meta_data["asking_price"] = self.find_int(meta[1].text)
        meta_data["unit"]["area"] = self.find_int(
            meta[2].find(text=True, recursive=False)
        )
        meta_data["unit"]["num_rooms"] = self.find_int(
            meta[3].text.split("Slaapkamers")[0]
        )

        # Photos
        photos = soup.find_all("a", {"data-fancybox": "woning-gallery"})
        for photo_url in photos:
            meta_data["photos"].append(photo_url["href"])

        # Description
        description = soup.find("div", {"class": "woning-content-inner"}).find_all("p")
        for p in description:
            p_text = p.text.lower()

            if "bijzonderheden" in p_text:
                segments = re.split("[-\n]", p_text)
                for s in segments:

                    if "bouwjaar" in s and not "ketel" in s:
                        try:
                            meta_data["building"]["year_constructed"] = self.find_int(
                                s.split(",")[0]
                            )
                        except ValueError:
                            pass

                    elif "woonoppervlakte" in s:
                        meta_data["unit"]["area"] = self.find_float(s.split("m")[0])

                    elif "voortuin" in s or "achtertuin" in s or " tuin" in s:
                        meta_data["unit"]["tags"].append("garden")

                    elif "eigen grond" in s:
                        meta_data["unit"]["own_land"] = True
                    elif "erfpacht" in s:
                        meta_data["unit"]["own_land"] = False

                    elif "energielabel" in s:
                        label = s.split("energielabel")[1]
                        label = label.replace(":", "").replace(" ", "").upper()
                        meta_data["unit"]["energy"]["label"] = label

                break

        # Bounce broken listings
        if not meta_data["unit"].get("area"):
            raise SkipListing("Unable to find area")

        return meta_data


if __name__ == "__main__":
    scraper = VandevijverScraper()

    loop = asyncio.get_event_loop()
    loop.run_until_complete(scraper.start())
