import asyncio
import json
from datetime import datetime
from typing import List, Tuple, Union

import httpx
from app.broadcast import broadcast_apartment
from app.common import MissingListing, SkipListing
from app.models import Apartment
from app.scrapers.base import BaseScraper
from odmantic import AIOEngine
from pydantic.error_wrappers import ValidationError as PydanticError

engine = AIOEngine(database="aanbod")


class OomsScraper(BaseScraper):
    MAKELAARDIJ: str = "ooms"
    BASE_URL: str = "https://ooms.com/"
    QUERY: str = (
        "?buyOrRent=buy&textSearch=rotterdam&orderBy=created_at&orderDirection=desc"
    )

    async def start(self, update_existing: bool = False, debug: bool = False):
        apartment_items = await self.get_apartments()
        self.print_header(f"| Scraped {len(apartment_items)} listings")
        if debug and apartment_items:
            apartment_items = [apartment_items[0]]

        for item in apartment_items:
            url = item[0]
            listing = await engine.find_one(Apartment, Apartment.url == f"{url}")

            # Skip existing if not outdated
            if listing and not update_existing and not debug:
                continue

            # Otherwise scrape
            try:
                listing_data = await self.scrape_item(item[1])
                apartment = Apartment.parse_obj(listing_data)

            except SkipListing:
                continue

            except (MissingListing, PydanticError) as e:
                print(f"\n{url}")
                print(f"{e}\n")
                continue

            # Create or update DB entry
            if debug:
                self.print_header(f"+ {apartment.address}")
                print(listing_data)

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

    # Specific functions
    async def get_apartments(self) -> List[Tuple[str, str]]:
        """
        Fetch list of apartment urls from inventory
        """
        list_url = f"{self.BASE_URL}api/properties/available.json"

        async with httpx.AsyncClient() as client:
            result = await client.get(list_url)

        if not result.status_code == 200:
            print(f"Error: {result}")
            return []

        content = json.loads(result.content)
        objs = content.get("objects", [])

        items: List[Tuple[str, str]] = []
        for i in objs:
            item_url = i["url"]
            if "-rotterdam-" in item_url and i["buy_or_rent"] == "buy":
                items.append((item_url, json.dumps(i)))

        return items

    async def scrape_item(self, item_json: str):
        """
        Extract feature metadata from JSON
        """
        item_data = json.loads(item_json)
        meta_data = {
            "makelaardij": self.MAKELAARDIJ,
            "building": {},
            "unit": {"energy": {}, "tags": []},
            "photos": [],
        }

        meta_data["url"] = item_data["url"]

        meta_data["address"] = item_data["short_title"]
        meta_data["asking_price"] = item_data["buy_price"]
        meta_data["available"] = item_data["is_available"]

        meta_data["unit"]["area"] = item_data["usable_area_living_function"]
        meta_data["building"]["year_constructed"] = item_data.get("build_year")

        if created_at := item_data.get("created_at"):
            meta_data["added"] = datetime.fromisoformat(created_at.split("+")[0])

        if num_rooms := item_data.get("amount_of_rooms"):
            meta_data["unit"]["num_rooms"] = int(num_rooms)

        garden_types = item_data.get("garden_types")
        if "achtertuin" in garden_types or "voortuin" in garden_types:
            meta_data["unit"]["tags"].append("garden")

        # Bounce broken listings
        if not meta_data["unit"].get("area"):
            raise SkipListing("Unable to find area")

        return meta_data


if __name__ == "__main__":
    scraper = OomsScraper()

    loop = asyncio.get_event_loop()
    loop.run_until_complete(scraper.start())
