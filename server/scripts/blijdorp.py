import sys
import re
from time import sleep
from typing import List
from random import randint

import requests
from bs4 import BeautifulSoup

BASE_URL = "https://www.blijdorpmakelaardij.nl"
CITY = "rotterdam"

DELAY = 5
JITTER = 2


def main():
    print("Starting scraper")

    apartment_urls = []
    skip_limit = 10
    skip_index = 0

    while skip_index < skip_limit:
        skip_index += 1
        index_urls = scrape_page(skip_index)
        if index_urls:
            apartment_urls += index_urls
            sleep(get_interval(DELAY, JITTER))
        else:
            break

    print(f"Done, scrapped {len(apartment_urls)} listings.")


def scrape_page(index: int) -> List[str]:
    url = f"{BASE_URL}/woningaanbod/koop/{CITY}?skip={index*10}"

    print(f"({index}) {url} ", end="")
    result = requests.get(url)
    print(f"[{result.status_code}]")

    # Check for good status
    if result.status_code == 404:
        return []
    elif not result.status_code == 200:
        raise Exception(f"Error: {result.reason}")

    # Extract HTML
    soup = BeautifulSoup(result.content, "html.parser")
    items = soup.find_all("a", {"class": "object_data_container"})

    # Extract apartment object urls
    urls = []
    for item in items:
        item_url = item["href"].split("?")[0]
        urls.append(item_url)

    return urls


def scrape_item(item_url: str):
    url = f"{BASE_URL}{item_url}"
    url_parts = item_url.split("/")

    print(f"+ {url_parts[-2]} -> {url_parts[-1]} ", end="")
    result = requests.get(url)
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

    # Fetch photos
    photo_urls = []
    for photo in photos:
        photo_urls.append(photo["src"])

    item_data["photos"] = photo_urls

    print(item_data)


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

    if (rooms_str := raw_data.get("Aantal kamers")) is not None:
        num_rooms = int(rooms_str.split(" ")[0])

    if "Woonlaag" in raw_data and "e woonlaag" in raw_data["Woonlaag"]:
        num_floors = int(raw_data["Woonlaag"].split("e")[0])

    tags = []
    if raw_data.get("Tuin aanwezig") == "Ja":
        tags.append("garden")
    if raw_data.get("Heeft schuur/berging") == "Ja":
        tags.append("shed")
    if raw_data.get("Opstal verzekering") == "Ja":
        tags.append("theft_insurance")
    if raw_data.get("Heeft een lift") == "Ja":
        tags.append("lift")

    data_dict = {
        "uuid": raw_data["Referentienummer"],
        "asking_price": find_int(raw_data["Vraagprijs"]),
        "year_constructed": int(raw_data["Bouwperiode"]),
        "building_type": raw_data.get("Soort bouw"),
        "vve_cost": find_int(raw_data.get("Servicekosten")),
        "own_land": own_land,
        "parking": raw_data.get("Parkeergelegenheid"),
        "area": find_int(raw_data["Gebruiksoppervlakte wonen"]),
        "volume": find_int(raw_data["Inhoud"]),
        "num_bathrooms": find_int(raw_data["Aantal badkamers"]),
        "num_rooms": num_rooms,
        "num_floors": num_floors,
        "roof": {
            "type": raw_data.get("Type dak"),
            "material": raw_data.get("Dakbedekking"),
        },
        "energy": {
            "heating": raw_data.get("Verwarmingssysteem"),
            "water": raw_data.get("Warm water"),
            "label": raw_data.get("Energielabel"),
        },
        "date_added": raw_data["Aangeboden sinds"],
        "last_updated": raw_data["Laatste wijziging"],
        "available": "Status" not in raw_data,
        "tags": tags,
    }
    return data_dict


def find_int(value: str) -> int:
    return int(re.sub(r"[^0-9]", "", value)) if value is not None else None


def get_interval(base_value: float, jitter: float) -> float:
    """
    Randomized sleep intervals
    """
    return base_value + randint(-jitter * 10, jitter * 10) / 10


if __name__ == "__main__":
    # main()
    scrape_item("/woningaanbod/koop/rotterdam/wijnbrugstraat/39")
