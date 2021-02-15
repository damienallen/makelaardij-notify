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
JITTER = 1

engine = AIOEngine(database="aanbod")


async def main(update_existing: bool = False):
    apartment_urls = []
    page_limit = 20
    page_index = 1

    while page_index <= page_limit:
        index_urls = await scrape_page(page_index)
        if index_urls:
            apartment_urls += index_urls
            sleep(get_interval(PAGE_DELAY, JITTER))
        else:
            break
        page_index += 1

    print(
        f"[{datetime.now().isoformat(' ', 'seconds')}] {MAKELAARDIJ}    | Scraped {len(apartment_urls)} listings"
    )

    if False:
        l = await scrape_item(
            "https://www.voorberg.nl/woningaanbod/nolensstraat-18-a1-rotterdam/"
        )
        print(l)
    else:
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
        f"[{datetime.now().isoformat(' ', 'seconds')}] {MAKELAARDIJ}    + {addr} ",
        end="",
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

    if not item_data["unit"].get("area"):
        raise InvalidListing("Unable to find area")

    return item_data


def extract_features(soup):
    """
    Extract feature metadata from listing
    """
    meta_data = {
        "makelaardij": MAKELAARDIJ,
        "building": {},
        "unit": {"energy": {}, "tags": []},
        "photos": [],
    }
    main_content = soup.find("div", {"class": "woning"})
    summary = main_content.find_all("div", {"class": "container"})[1]

    # Basics
    basic_info = summary.find("div", {"class": "col"})
    meta_data["address"] = basic_info.find("h1").text.split(" | ")[0]
    meta_data["asking_price"] = find_int(basic_info.find("p", {"class": "price"}).text)
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
            meta_data["building"]["year_constructed"] = find_int(value)

        elif label == "Geplaatst op":
            meta_data["added"] = find_date(value)

        elif label == "Laatste gewijzigd op":
            meta_data["updated"] = find_date(value)

        elif label == "Woonruimte":
            meta_data["unit"]["area"] = find_float(value.split("m")[0])

        elif label == "Dak":
            meta_data["building"]["roof_type"] = value

        elif label == "Verwarming":
            meta_data["unit"]["energy"]["heating"] = value

        elif label == "Warm water":
            meta_data["unit"]["energy"]["water"] = value

        elif label == "Aantal kamers":
            meta_data["unit"]["num_rooms"] = find_int(value)

        elif label == "Tuin":
            if "achtertuin" in value or "voortuin" in value:
                meta_data["unit"]["tags"].append("garden")

    return meta_data


def find_date(date_str: Union[str, None]) -> Union[datetime, None]:
    if not date_str:
        return None

    date = date_str.split("-")
    return datetime(year=int(date[2]), month=int(date[1]), day=int(date[0]))


if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())
