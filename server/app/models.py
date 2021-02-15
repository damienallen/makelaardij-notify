from datetime import datetime
from typing import List, Optional

from odmantic import EmbeddedModel, Field, Model


class Building(EmbeddedModel):
    year_constructed: Optional[int] = None
    building_type: Optional[str] = None
    roof_type: Optional[str] = None
    roof_material: Optional[str] = None
    num_floors: Optional[int] = None
    parking: Optional[str] = None


class Energy(EmbeddedModel):
    heating: Optional[str] = None
    water: Optional[str] = None
    label: Optional[str] = None


class Unit(EmbeddedModel):
    area: int
    volume: Optional[int] = None
    energy: Energy

    vve_cost: Optional[int] = None
    own_land: Optional[bool] = None
    num_bathrooms: Optional[int] = None
    num_rooms: Optional[int] = None
    num_floors: Optional[int] = None
    tags: List[str] = Field(default_factory=list)


class Apartment(Model):
    makelaardij: str
    asking_price: int
    address: str
    neighborhood: Optional[str] = None
    location: Optional[List[float]] = None

    url: str
    photos: List[str] = Field(default_factory=list)
    available: bool = True
    hidden: bool = False

    unit: Unit
    building: Building

    entry_added: datetime = Field(default_factory=datetime.utcnow)
    entry_updated: datetime = Field(default_factory=datetime.utcnow)
    added: Optional[datetime] = None
    updated: Optional[datetime] = None
