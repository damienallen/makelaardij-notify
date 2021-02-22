import asyncio

from app.scrapers.realworks import RealWorksScraper


class TeRieleScraper(RealWorksScraper):

    MAKELAARDIJ: str = "teriele"
    BASE_URL: str = "https://www.terielemakelaardij.nl"


if __name__ == "__main__":
    scraper = TeRieleScraper()

    loop = asyncio.get_event_loop()
    loop.run_until_complete(scraper.start())
