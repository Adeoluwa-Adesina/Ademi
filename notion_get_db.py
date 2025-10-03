from notion_client import Client
from config import api_key, models_scorecard_db_id
from random import randint

db_id = models_scorecard_db_id

client = Client(auth=api_key)

def get_notion_database(database_id):
    try:
        db = client.databases.retrieve(database_id=database_id)
        pages = client.databases.query(database_id=database_id)["results"]
        print(db, pages)
    except Exception as e:
        print(e)


get_notion_database(db_id)