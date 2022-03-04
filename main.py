from typing import Optional
from fastapi import FastAPI
from pydantic import BaseSettings
from pymongo import MongoClient
import pprint


class Settings(BaseSettings):
    MONGODB_URI: str


settings = Settings(_env_file='.env')
app = FastAPI()

mongo_client = MongoClient(settings.MONGODB_URI)
db = mongo_client.prod_db
users = db.users


@app.get("/")
def read_root():
    some_user = users.find_one(None, {'_id': 0})
    pprint.pprint(some_user)
    return {"some user": some_user}
