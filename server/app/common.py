import re
from random import randint
from datetime import datetime


class MissingListing(Exception):
    pass


class SkipListing(Exception):
    pass


class InvalidListing(Exception):
    pass


def find_int(value: str) -> int:
    return int(re.sub(r"[^0-9]", "", value)) if value is not None else None


def find_float(value: str) -> float:
    return (
        float(re.sub(r"[^0-9.,]", "", value).replace(",", "."))
        if value is not None
        else None
    )


def get_interval(base_value: int, jitter: int) -> float:
    """
    Randomized sleep intervals
    """
    return base_value + randint(-jitter * 10, jitter * 10) / 10


def print_new_listing(m: str, a: str):
    m_padded = "{:<12}".format(m)
    print(
        f"[{datetime.now().isoformat(' ', 'seconds')}] {m}+ {a}",
    )


months_nl = {
    "januari": 1,
    "februari": 2,
    "maart": 3,
    "april": 4,
    "mei": 5,
    "juni": 6,
    "juli": 7,
    "augustus": 8,
    "september": 9,
    "oktober": 10,
    "november": 11,
    "december": 12,
}
