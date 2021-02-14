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

BASE_URL = "https://www.maartenmakelaardij.nl"
MAKELAARDIJ = "maarten"
CITY = "rotterdam"

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

    for url in apartment_urls:
        listing = await engine.find_one(Apartment, Apartment.url == f"{url}")

        if listing is None:
            listing_data = await scrape_item(url)
            apartment = Apartment.parse_obj(listing_data)
            await engine.save(apartment)
            sleep(get_interval(LISTING_DELAY, JITTER))

        # else:
        #     print(f"Skipping '{listing.address}', already in DB")


async def scrape_page() -> List[str]:
    url = f"{BASE_URL}/aanbod/{CITY}/"

    # print(url)
    async with httpx.AsyncClient() as client:
        result = await client.get(url)

    # Check for good status
    if not result.status_code == 200:
        print(f"Error: {result}")
        return []

    # Extract HTML
    soup = BeautifulSoup(result.content, "html.parser")
    items = soup.find_all("a")

    # Extract apartment object urls
    urls = []
    for item in items:
        if "woning/rotterdam-" in item["href"]:
            urls.append(item["href"])

    return list(set(urls))


async def scrape_item(item_url: str):
    addr = item_url.split("/")[-2].split("rotterdam-")[1].replace("-", " ")

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
    }

    dt = soup.find_all("dt")
    dd = soup.find_all("dd")

    # Features
    for ind, key in enumerate(dt):

        if "Bouwjaar" in key.string:
            meta_data["building"]["year_constructed"] = find_int(dd[ind].string)

        elif "Woonoppervlakte" in key.string:
            meta_data["unit"]["area"] = find_float(dd[ind].text.split(" ")[0])

        elif "Aantal kamers" in key.string:
            meta_data["unit"]["num_rooms"] = find_int(dd[ind].text)

        elif "verdiepingen" in key.string:
            meta_data["unit"]["num_floors"] = find_int(dd[ind].text)

        elif "Status" in key.string:
            meta_data["available"] = "Beschikbaar" in dd[ind].text

        elif "Buitenruimte" in key.string and "TUIN" in dd[ind].text:
            meta_data["unit"]["tags"].append("garden")

    # Other fields
    meta_data["address"] = soup.find("span", {"class": "adres"}).string
    meta_data["asking_price"] = find_int(
        soup.find("span", {"class": "price"}).string.replace(".", "")
    )

    description = soup.find("div", {"id": "read-more-content"}).children
    for p in description:
        p_text = str(p.text)
        if "Eigen grond" in p_text:
            meta_data["unit"]["own_land"] = True
        elif "erfpacht" in p_text:
            meta_data["unit"]["own_land"] = False

        if "Energielabel" in p_text:
            label = p_text.split("Energielabel: ")[1][0]
            meta_data["unit"]["energy"]["label"] = label

        break

    return meta_data


if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())
