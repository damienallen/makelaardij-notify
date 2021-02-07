import asyncio

from arq import create_pool
from arq.connections import RedisSettings
from httpx import AsyncClient
from scrapers.blijdorp import scrape_item


async def run_scrapers(ctx, url):
    client: AsyncClient = ctx["client"]
    # r = await client.get(url)
    #     content = await response.text()
    #     print(f"{url}: {content:.80}...")
    item_dict = scrape_item(url)
    print(item_dict)
    return


async def startup(ctx):
    ctx["client"] = AsyncClient()


async def shutdown(ctx):
    await ctx["client"].close()


async def main():
    redis = await create_pool(RedisSettings(host="redis"))
    url = "/woningaanbod/koop/rotterdam/wijnbrugstraat/39"
    await redis.enqueue_job("run_scrapers", url)


# WorkerSettings defines the settings to use when creating the work,
# it's used by the arq cli
class WorkerSettings:
    functions = [run_scrapers]
    on_startup = startup
    on_shutdown = shutdown


if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())