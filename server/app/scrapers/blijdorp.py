import asyncio
import re
from datetime import datetime
from random import randint
from time import sleep
from typing import List, Union

import httpx
from app.common import months_nl
from app.models import Apartment
from bs4 import BeautifulSoup
from odmantic import AIOEngine

BASE_URL = "https://www.blijdorpmakelaardij.nl"
MAKELAARDIJ = "blijdorp"
CITY = "rotterdam"

PAGE_DELAY = 2
LISTING_DELAY = 2
JITTER = 2

engine = AIOEngine(database="aanbod")


async def main():
    print("Starting scraper")

    apartment_urls = []
    skip_limit = 10
    skip_index = 0

    while skip_index < skip_limit:
        index_urls = await scrape_page(skip_index)
        if index_urls:
            apartment_urls += index_urls
            sleep(get_interval(PAGE_DELAY, JITTER))
        else:
            break
        skip_index += 1

    print(f"[{datetime.now().isoformat(' ', 'seconds')}] {MAKELAARDIJ} | Scraped {len(apartment_urls)} listings")

    for url in apartment_urls:
        listing = await engine.find_one(Apartment, Apartment.url == f"{BASE_URL}{url}")

        if listing is None:
            listing_data = await scrape_item(url)
            apartment = Apartment.parse_obj(listing_data)
            await engine.save(apartment)
            sleep(get_interval(LISTING_DELAY, JITTER))

        # else:
        #     print(f"Skipping '{listing.address}', already in DB")


async def scrape_page(index: int) -> List[str]:
    url = f"{BASE_URL}/woningaanbod/koop/{CITY}?skip={index*10}"

    # print(f"({index}) {url} ", end="")
    async with httpx.AsyncClient() as client:
        result = await client.get(url)
    # print(f"[{result.status_code}]")

    # Check for good status
    if result.status_code == 404:
        return []
    elif not result.status_code == 200:
        print(f"Error: {result.reason}")
        return []

    # Extract HTML
    soup = BeautifulSoup(result.content, "html.parser")
    items = soup.find_all("a", {"class": "object_data_container"})

    # Extract apartment object urls
    urls = []
    for item in items:
        item_url = item["href"].split("?")[0]
        urls.append(item_url)

    return urls


async def scrape_item(item_url: str):
    url = f"{BASE_URL}{item_url}"
    url_parts = item_url.split("/")

    print(f"[{datetime.now().isoformat(' ', 'seconds')}] {MAKELAARDIJ} + {url_parts[-2]} {url_parts[-1]} ", end="")
    async with httpx.AsyncClient() as client:
        result = await client.get(url)
    print(f"[{result.status_code}]")

    # Check for good status
    if result.status_code == 404:
        print("Warning, property skipped, not found")
    elif not result.status_code == 200:
        raise Exception(f"Error: {result.reason}")

    # Extract HTML
    soup = BeautifulSoup(result.content, "html.parser")
    photos = soup.find_all("img", {"class": "content"})
    features = soup.find_all("div", {"class": ["table-responsive", "feautures"]})

    item_data = extract_features(features)
    item_data["url"] = url

    # Address
    address = soup.find("h1", {"class": "obj_address"})
    if address:
        address_str = (
            address.string.split(": ")[1] if ": " in address.string else address.string
        ).split(",")
    item_data["address"] = address_str[0]

    # Photos
    photo_urls = []
    for photo in photos:
        photo_urls.append(photo["src"])
    item_data["photos"] = photo_urls

    return item_data


def extract_features(features):
    """
    Extract feature metadata from listing
    """
    raw_data = {}
    for section in features:
        table_rows = section.find_all("tr")
        for row in table_rows:
            row_data = row.find_all("td")
            if len(row_data) > 1:
                raw_data[row_data[0].string] = row_data[1].string

    # Harder to extract items
    own_land = raw_data["Eigendom"] == "Eigendom" if raw_data.get("Eigendom") else None

    num_rooms = None
    if (rooms_str := raw_data.get("Aantal kamers")) is not None:
        num_rooms = int(rooms_str.split(" ")[0])

    num_floors = None
    if "Woonlaag" in raw_data and "e woonlaag" in raw_data["Woonlaag"]:
        num_floors = int(raw_data["Woonlaag"].split("e")[0])

    tags = find_tags(raw_data)

    return {
        "makelaardij": MAKELAARDIJ,
        "uuid": raw_data["Referentienummer"],
        "asking_price": find_int(raw_data["Vraagprijs"]),
        "available": "Status" not in raw_data,
        "unit": {
            "area": find_int(raw_data["Gebruiksoppervlakte wonen"]),
            "volume": find_int(raw_data["Inhoud"]),
            "energy": {
                "heating": raw_data.get("Verwarmingssysteem"),
                "water": raw_data.get("Warm water"),
                "label": raw_data.get("Energielabel"),
            },
            "vve_cost": find_int(raw_data.get("Servicekosten")),
            "own_land": own_land,
            "num_bathrooms": find_int(raw_data["Aantal badkamers"]),
            "num_rooms": num_rooms,
            "tags": tags,
        },
        "building": {
            "year_constructed": int(raw_data["Bouwperiode"]),
            "building_type": raw_data.get("Soort bouw"),
            "roof_type": raw_data.get("Type dak"),
            "roof_material": raw_data.get("Dakbedekking"),
            "num_floors": num_floors,
            "parking": raw_data.get("Parkeergelegenheid"),
        },
        "added": find_date(raw_data.get("Aangeboden sinds")),
        "updated": find_date(raw_data.get("Laatste wijziging")),
    }


def find_date(date_str: Union[str, None]) -> datetime:
    if not date_str:
        return None

    date = date_str.split(" ")
    return datetime(
        year=int(date[3]), month=months_nl[date[2].lower()], day=int(date[1])
    )


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


def find_int(value: str) -> int:
    return int(re.sub(r"[^0-9]", "", value)) if value is not None else None


def get_interval(base_value: float, jitter: float) -> float:
    """
    Randomized sleep intervals
    """
    return base_value + randint(-jitter * 10, jitter * 10) / 10


if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())
