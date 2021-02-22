import asyncio
import firebase_admin
from firebase_admin import credentials, messaging
from datetime import datetime
from odmantic import AIOEngine

from app.common import MIN_PRICE, MAX_PRICE, MIN_AREA, MAX_AREA, MIN_YEAR, MAX_YEAR
from app.models import Apartment, Subscription

# FCM
cred = credentials.Certificate("/etc/fcm.json")
firebase_admin.initialize_app(cred)

# Mongo
engine = AIOEngine(database="aanbod")


def passes_filter(s: Subscription, a: Apartment) -> bool:
    price = a.asking_price / 1000
    if s.filter.price.low > MIN_PRICE and price < s.filter.price.low:
        return False
    elif s.filter.price.high < MAX_PRICE and price > s.filter.price.high:
        return False
    elif s.filter.area.low > MIN_AREA and a.unit.area < s.filter.area.low:
        return False
    elif s.filter.area.high < MAX_AREA and a.unit.area > s.filter.area.high:
        return False
    elif a.building.year_constructed is not None:
        if (
            s.filter.year.low > MIN_YEAR
            and a.building.year_constructed < s.filter.year.low
        ):
            return False
        elif (
            s.filter.year.high < MAX_AREA
            and a.building.year_constructed > s.filter.year.high
        ):
            return False

    return True


async def broadcast_apartment(a: Apartment):
    subs = await engine.find(Subscription)

    count = 0
    for s in subs:
        if s.active:
            if passes_filter(s, a):
                title = f"{a.address}"
                body = f"{a.makelaardij.upper()} - {a.unit.area} m² - €{int(a.asking_price/1000)} K"
                count += 1
                await send_message(s, title, body, a.url)


async def broadcast(title: str, body: str, url: str):
    subs = await engine.find(Subscription)
    print(f"Found {len(subs)} subscriptions")

    for s in subs:
        if s.active:
            await send_message(s, title, body, url)


async def send_message(s: Subscription, title: str, body: str, url: str):
    n = messaging.WebpushNotification(
        title=title,
        body=body,
        icon="https://aanbod.dallen.dev/assets/notify_icon.png",
        badge="https://aanbod.dallen.dev/assets/notify_badge.png",
    )
    w = messaging.WebpushConfig(
        notification=n,
    )

    message = messaging.Message(
        data={
            "url": url,
            "time": datetime.now().isoformat(),
        },
        webpush=w,
        token=s.token,
    )
    try:
        messaging.send(message)
    except (
        firebase_admin._messaging_utils.UnregisteredError,
        firebase_admin.exceptions.InternalError,
    ):
        await engine.delete(s)


if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(
        broadcast("Hallo", "Rotterdam", "https://aanbod.dallen.dev")
    )
