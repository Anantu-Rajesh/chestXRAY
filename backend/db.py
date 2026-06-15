import os   
from dotenv import load_dotenv    
from pymongo import MongoClient

load_dotenv()
mongodb_url = os.getenv('MONGODB_URL')
client = MongoClient(mongodb_url)
db = client.get_database('chestxray')

users_collection = db['users']
history_collection = db['history']


    