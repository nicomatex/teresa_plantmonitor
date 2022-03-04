
from typing import Optional
from pydantic import BaseSettings
from pymongo import MongoClient
from pydantic import BaseSettings


class Settings(BaseSettings):
    MONGODB_URI: str


settings = Settings(_env_file='.env')

mongo_client = MongoClient(settings.MONGODB_URI)
db = mongo_client.prod_db
users = db.users
