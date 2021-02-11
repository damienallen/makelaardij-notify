import os
from datetime import datetime
from typing import List

from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from models import Apartment
from motor.motor_asyncio import AsyncIOMotorClient
from odmantic import AIOEngine, Model, ObjectId

# Fast API main app
app = FastAPI()

# Connect to mongo
client = AsyncIOMotorClient("mongodb://mongo:27017/")
engine = AIOEngine(motor_client=client, database="aanbod")

# Handle CORS
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Main app
@app.get("/api/")
async def hello():
    return {"Hello": "Rotterdam"}


@app.get("/api/apartments/", response_model=List[Apartment])
async def list_apartments():
    """
    List all apartment objects
    """
    apartments = await engine.find(Apartment)
    return apartments


@app.get("/api/apartments/clear/")
async def clear_apartments(request: Request):
    """
    Remove all apartments
    """
    # Check for master token
    if not request.headers.get("Master") == os.environ.get("MASTER_TOKEN"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        )

    # Remove apartments
    apartments = await engine.find(Apartment)
    for a in apartments:
        await engine.delete(a)
    return {"detail": "All apartments removed from collection"}


@app.get("/api/apartment/{oid}/")
async def get_apartment(oid: str, response_model=Apartment):
    """
    Retrieve apartment from DB
    """
    apartment = await engine.find_one(Apartment, Apartment.id == oid)
    if apartment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Object ID not found"
        )

    return apartment
