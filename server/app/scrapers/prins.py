import asyncio

from app.scrapers.realworks import RealWorksScraper


class PrinsScraper(RealWorksScraper):

    MAKELAARDIJ: str = "prins"
    BASE_URL: str = "https://www.prinsmakelaardij.nl"


if __name__ == "__main__":
    scraper = PrinsScraper()

    loop = asyncio.get_event_loop()
    loop.run_until_complete(scraper.start())
