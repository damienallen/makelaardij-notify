from mongoengine import (
    Document,
    BooleanField,
    DateTimeField,
    FloatField,
    IntField,
    StringField,
)
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional


class Building(BaseModel):
    year_constructed: Optional[int] = None
    building_type: Optional[str] = None
    roof_type: Optional[str] = None
    roof_material: Optional[str] = None
    num_floors: Optional[int] = None
    parking: Optional[bool] = None


class Energy(BaseModel):
    heating: Optional[str] = None
    water: Optional[str] = None
    label: Optional[str] = None


class Unit(BaseModel):
    area: int
    volume: int
    energy: Field(default_factory=Energy)

    vve_cost: Optional[int] = None
    own_land: Optional[bool] = None
    num_bathrooms: Optional[int] = None
    num_rooms: Optional[int] = None
    tags: List[str] = Field(default_factory=list)


class Apartment(BaseModel):
    uuid: str
    asking_price: int
    available: bool = True
    hidden: bool = False

    unit: Field(default_factory=Unit)
    building: Field(default_factory=Building)

    date_added: datetime = datetime.now()
    date_listed: Optional[datetime] = None
    last_updated: Optional[datetime] = None


class ApartmentDB(Document):
    """
    Mongo apartment schema
    """

    apartment = StringField(max_length=60)
    name_la = StringField(max_length=60)
    name_nl = StringField(max_length=60)
    name_en = StringField(max_length=60)
    width = FloatField(null=True)
    height = FloatField(null=True)
