from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from mongoengine import connect, errors
import os

from datetime import datetime
from secrets import token_urlsafe

from models import (
    ImportSpeciesJson,
    SpeciesDB,
    Species,
)

# Fast API main app
app = FastAPI()

# Handle CORS
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect to mongo
connect("aanbod", host="mongodb://mongo")


# Main app


@app.get("/api/")
def hello():
    return {"Hello": "Rotterdam"}


@app.get("/api/apartments/")
def list_apartments():
    """
    List all apartment objects
    """
    apartments = []
    for apartment in ApartmentDB.objects:
        apartments.append(Apartment.from_mongo(apartment))
    return apartments


@app.get("/api/apartments/clear/")
def clear_apartments(request: Request):
    """
    Remove all apartments
    """
    # Check for master token
    if not request.headers.get("Master") == os.environ.get("MASTER_TOKEN"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        )

    ApartmentDB.objects.all().delete()
    return {"detail": "All apartments removed from collection"}


@app.get("/api/apartment/{oid}/")
def get_apartment(oid: str):
    """
    Retrieve apartment from DB
    """
    try:
        selected_apartment = ApartmentDB.objects.get(id=oid)
        return Apartment.from_mongo(selected_apartment)
    except ApartmentDB.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Object ID not found"
        )
