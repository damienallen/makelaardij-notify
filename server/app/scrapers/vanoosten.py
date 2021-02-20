import asyncio

from app.scrapers.realworks import RealWorksScraper


class VanOostenScraper(RealWorksScraper):

    MAKELAARDIJ: str = "vanoosten"
    BASE_URL: str = "https://www.vanoostenmakelaardij.nl"


if __name__ == "__main__":
    scraper = VanOostenScraper()

    loop = asyncio.get_event_loop()
    loop.run_until_complete(scraper.start())
