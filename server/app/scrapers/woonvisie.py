import asyncio

from app.scrapers.realworks import RealWorksScraper


class WoonVisieScraper(RealWorksScraper):

    MAKELAARDIJ: str = "woonvisie"
    BASE_URL: str = "https://www.woonvisiemakelaars.nl"
    ITEM_COUNT: int = 96


if __name__ == "__main__":
    scraper = WoonVisieScraper()

    loop = asyncio.get_event_loop()
    loop.run_until_complete(scraper.start())
