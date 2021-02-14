import asyncio
import re
from datetime import datetime
from random import randint
from time import sleep
from typing import List, Union

import httpx
from app.common import find_float, find_int, get_interval
from app.models import Apartment
from bs4 import BeautifulSoup
from odmantic import AIOEngine

BASE_URL = "https://vandevijvermakelaardij.nl"
MAKELAARDIJ = "vandevijver"

PAGE_DELAY = 1
LISTING_DELAY = 2
JITTER = 2

engine = AIOEngine(database="aanbod")


async def main():
    apartment_urls = await scrape_page()
    sleep(PAGE_DELAY)

    print(
        f"[{datetime.now().isoformat(' ', 'seconds')}] {MAKELAARDIJ} | Scraped {len(apartment_urls)} listings"
    )

    listing_data = await scrape_item(
        "https://vandevijvermakelaardij.nl/woning/zonnebloemstraat-80a/"
    )
    # listing_data = await scrape_item(apartment_urls[0])
    print(listing_data)
    # for url in apartment_urls:
    #     listing = await engine.find_one(Apartment, Apartment.url == f"{url}")

    #     if listing is None:
    #         listing_data = await scrape_item(url)
    #         apartment = Apartment.parse_obj(listing_data)
    #         await engine.save(apartment)
    #         sleep(get_interval(LISTING_DELAY, JITTER))

    # else:
    #     print(f"Skipping '{listing.address}', already in DB")


async def scrape_page() -> List[str]:
    url = f"{BASE_URL}/woningen/te-koop/"

    print(url)
    async with httpx.AsyncClient() as client:
        result = await client.get(url)

    # Check for good status
    if not result.status_code == 200:
        print(f"Error: {result}")
        return []

    # Extract HTML
    soup = BeautifulSoup(result.content, "html.parser")
    items = soup.find_all("a", {"class": "portfolio-box-inner"})

    # Extract apartment object urls
    urls = []
    for item in items:
        if "/woning/" in item.get("href"):
            urls.append(item["href"])

    return list(set(urls))


async def scrape_item(item_url: str):
    addr = item_url.split("/")[-2].replace("-", " ")

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
        "available": True,
        "photos": [],
    }

    features = soup.find("div", {"class": "woning-title"})

    # Basics
    meta_data["address"] = features.find("h1").text

    meta = features.find_all("h5")
    meta_data["asking_price"] = find_int(meta[1].text)
    meta_data["unit"]["area"] = find_int(meta[2].find(text=True, recursive=False))
    meta_data["unit"]["num_rooms"] = find_int(meta[3].text.split("Slaapkamers")[0])

    # Photos
    photos = soup.find_all("a", {"data-fancybox": "woning-gallery"})
    for photo_url in photos:
        meta_data["photos"].append(photo_url["href"])

    # Description
    description = soup.find("div", {"class": "woning-content-inner"}).find_all("p")
    for p in description:
        p_text = p.text.lower()

        if "bijzonderheden" in p_text:
            segments = p_text.split("\n")
            for s in segments:

                if "bouwjaar" in s:
                    meta_data["building"]["year_constructed"] = find_int(
                        s.split(",")[0]
                    )

                elif "woonoppervlakte" in s:
                    meta_data["unit"]["area"] = find_float(s.split("m")[0])

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

    return meta_data


if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())
