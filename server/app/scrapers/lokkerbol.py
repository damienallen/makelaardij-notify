import asyncio

from app.scrapers.realworks import RealWorksScraper


class LokkerbolScraper(RealWorksScraper):

    MAKELAARDIJ: str = "lokkerbol"
    BASE_URL: str = "https://www.lokkerbol.nl"


if __name__ == "__main__":
    scraper = LokkerbolScraper()

    loop = asyncio.get_event_loop()
    loop.run_until_complete(scraper.start())
