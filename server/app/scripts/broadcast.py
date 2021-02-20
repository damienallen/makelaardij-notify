import asyncio
import firebase_admin
from firebase_admin import credentials, messaging
from datetime import datetime
from odmantic import AIOEngine

from app.models import Subscription

# FCM
cred = credentials.Certificate("/etc/fcm.json")
firebase_admin.initialize_app(cred)

# Mongo
engine = AIOEngine(database="aanbod")


async def broadcast():
    subs = await engine.find(Subscription)
    print(f"Found {len(subs)} subscriptions")

    for s in subs:
        if s.active:
            n = messaging.WebpushNotification(title="Hallo", body="Rotjeknor")
            w = messaging.WebpushConfig(
                notification=n,
            )

            message = messaging.Message(
                data={
                    "url": "https://dallen.co",
                    "time": datetime.now().isoformat(),
                },
                webpush=w,
                token=s.token,
            )

            try:
                resp = messaging.send(message)
                print("Successfully sent message:", resp)
            except (
                firebase_admin._messaging_utils.UnregisteredError,
                firebase_admin.exceptions.InternalError,
            ):
                await engine.delete(s)


if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(broadcast())
