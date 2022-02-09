import asyncio

from app.scrapers.realworks import RealWorksScraper


class M1Scraper(RealWorksScraper):

    MAKELAARDIJ: str = "m1"
    BASE_URL: str = "https://www.m1makelaardij.nl"


if __name__ == "__main__":
    scraper = M1Scraper()

    loop = asyncio.get_event_loop()
    loop.run_until_complete(scraper.start())
