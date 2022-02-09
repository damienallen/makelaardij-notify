import asyncio

from app.scrapers.realworks import RealWorksScraper


class VanKleefScraper(RealWorksScraper):

    MAKELAARDIJ: str = "vankleef"
    BASE_URL: str = "https://www.vankleefmakelaars.nl"


if __name__ == "__main__":
    scraper = VanKleefScraper()

    loop = asyncio.get_event_loop()
    loop.run_until_complete(scraper.start())
