import asyncio
import json
import re
from datetime import datetime
from random import randint
from time import sleep
from typing import List, Union

import httpx
from app.common import InvalidListing, find_float, find_int, get_interval
from app.models import Apartment
from bs4 import BeautifulSoup
from odmantic import AIOEngine

BASE_URL = "https://www.voorberg.nl"
QUERY = "?s=Rotterdam&min-koop=0&max-koop=2000000&min-huur=0&max-huur=5000&rooms=nvt&opp=nvt&post_type=properties&koop_huur=koop"
MAKELAARDIJ = "voorberg"

PAGE_DELAY = 2
LISTING_DELAY = 2
JITTER = 2

engine = AIOEngine(database="aanbod")


async def main(update_existing: bool = False):
    # apartment_urls = []
    # page_limit = 1
    # page_index = 1

    # while page_index <= page_limit:
    #     index_urls = await scrape_page(page_index)
    #     if index_urls:
    #         apartment_urls += index_urls
    #         sleep(get_interval(PAGE_DELAY, JITTER))
    #     else:
    #         break
    #     page_index += 1

    # sleep(PAGE_DELAY)

    # print(
    #     f"[{datetime.now().isoformat(' ', 'seconds')}] {MAKELAARDIJ} | Scraped {len(apartment_urls)} listings"
    # )

    if True:
        l = await scrape_item(
            "https://www.voorberg.nl/woningaanbod/nolensstraat-18-a1-rotterdam/"
        )
        print(l)
    elif False:
        for url in apartment_urls:
            listing = await engine.find_one(Apartment, Apartment.url == f"{url}")

            # Skip existing if not outdated
            if listing and not update_existing:
                continue

            # Otherwise scrape
            try:
                listing_data = await scrape_item(url)
            except InvalidListing:
                continue

            apartment = Apartment.parse_obj(listing_data)

            if listing is None:
                await engine.save(apartment)
            else:
                listing.asking_price = apartment.asking_price
                listing.photos = apartment.photos
                listing.available = apartment.available
                listing.unit = apartment.unit
                listing.building = apartment.building
                listing.entry_updated = datetime.utcnow()

                await engine.save(listing)

            sleep(get_interval(LISTING_DELAY, JITTER))


async def scrape_page(page_num: int) -> List[str]:
    url = f"{BASE_URL}/page/{page_num}/{QUERY}"
    print(url)

    async with httpx.AsyncClient() as client:
        result = await client.get(url)

    # Check for good status
    if result.status_code == 404:
        return []
    elif not result.status_code == 200:
        print(f"Error: {result}")
        return []

    # Extract HTML
    soup = BeautifulSoup(result.content, "html.parser")
    items = soup.find_all("a", {"class": ["action-button", "white"]})

    # Extract apartment object urls
    urls = []
    for item in items:
        if "/woningaanbod/" in item.get("href"):
            urls.append(item["href"])

    return list(set(urls))


async def scrape_item(item_url: str):
    addr = item_url.split("/")[-2].replace("-", " ").replace("rotterdam", "")

    print(
        f"[{datetime.now().isoformat(' ', 'seconds')}] {MAKELAARDIJ} + {addr} ", end=""
    )
    async with httpx.AsyncClient() as client:
        result = await client.get(item_url)
    print(f"[{result.status_code}]")

    # Check for good status
    if result.status_code == 404:
        print("Warning, property skipped, not found")
    elif not result.status_code == 200:
        raise Exception(f"Error: {result}")

    # Extract HTML
    soup = BeautifulSoup(result.content, "html.parser")

    item_data = extract_features(soup)
    item_data["url"] = item_url

    return item_data


def extract_features(soup):
    """
    Extract feature metadata from listing
    """
    meta_data = {
        "makelaardij": MAKELAARDIJ,
        "building": {},
        "unit": {"energy": {}, "tags": []},
        # "available": True,
        "photos": [],
    }
    main_content = soup.find("div", {"class": "woning"})
    summary = main_content.find_all("div", {"class": "container"})[1]

    # Basics
    basic_info = summary.find("div", {"class": "col"})
    meta_data["address"] = basic_info.find("h1").text.split(" | ")[0]

    # meta_data["asking_price"] = find_int(meta[1].text)
    # meta_data["unit"]["area"] = find_int(meta[2].find(text=True, recursive=False))
    # meta_data["unit"]["num_rooms"] = find_int(meta[3].text.split("Slaapkamers")[0])

    # # Photos
    # photos = soup.find_all("a", {"data-fancybox": "woning-gallery"})
    # for photo_url in photos:
    #     meta_data["photos"].append(photo_url["href"])

    # # Description
    # description = soup.find("div", {"class": "woning-content-inner"}).find_all("p")
    # for p in description:
    #     p_text = p.text.lower()

    #     if "bijzonderheden" in p_text:
    #         segments = re.split("[-\n]", p_text)
    #         for s in segments:

    #             if "bouwjaar" in s and not "ketel" in s:
    #                 try:
    #                     meta_data["building"]["year_constructed"] = find_int(
    #                         s.split(",")[0]
    #                     )
    #                 except ValueError:
    #                     pass

    #             elif "woonoppervlakte" in s:
    #                 meta_data["unit"]["area"] = find_float(s.split("m")[0])

    #             elif "voortuin" in s or "achtertuin" in s or " tuin" in s:
    #                 meta_data["unit"]["tags"].append("garden")

    #             elif "eigen grond" in s:
    #                 meta_data["unit"]["own_land"] = True
    #             elif "erfpacht" in s:
    #                 meta_data["unit"]["own_land"] = False

    #             elif "energielabel" in s:
    #                 label = s.split("energielabel")[1]
    #                 label = label.replace(":", "").replace(" ", "").upper()
    #                 meta_data["unit"]["energy"]["label"] = label

    #         break

    return meta_data


if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())
