from pymongo import AsyncMongoClient

from app.config import settings

client = AsyncMongoClient(settings.mongo_url)
db = client[settings.mongo_db]
