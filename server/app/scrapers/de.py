import asyncio

from app.scrapers.realworks import RealWorksScraper


class DeMakelaarsScraper(RealWorksScraper):

    MAKELAARDIJ: str = "demakelaars"
    BASE_URL: str = "https://www.demakelaars.nu"


if __name__ == "__main__":
    scraper = DeMakelaarsScraper()

    loop = asyncio.get_event_loop()
    loop.run_until_complete(scraper.start())
