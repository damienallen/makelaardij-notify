# Filter constants
MIN_PRICE = 150
MAX_PRICE = 500

MIN_AREA = 50
MAX_AREA = 125

MIN_YEAR = 1900
MAX_YEAR = 2020


# Custom exceptions
class MissingListing(Exception):
    pass


class SkipListing(Exception):
    pass


class InvalidListing(Exception):
    pass
