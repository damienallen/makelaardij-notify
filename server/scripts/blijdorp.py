import sys
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
    city_url = f"{BASE_URL}/woningaanbod/koop/{CITY}?skip={index*10}"

    print(f"({index}) {city_url} ", end="")
    result = requests.get(city_url)
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


def get_interval(base_value: float, jitter: float) -> float:
    """
    Randomized sleep intervals
    """
    return base_value + randint(-jitter * 10, jitter * 10) / 10


if __name__ == "__main__":
    main()