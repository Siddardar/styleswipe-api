import requests
import json
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import certifi

class Uniqlo(object):
    def __init__(self) -> None:

        self.client = requests.Session()
        
        self.custom_headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:99.0) Gecko/20100101 Firefox/99.0',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        }

        self.data = {
            'path': ',,25596',
            'limit': '24',
            'offset': '0',
        }

    def fetch(self):
        res = self.client.get("https://www.uniqlo.com/sg/api/commerce/v3/en/products?path=%2C%2C25596&limit=24&offset=0", headers=self.custom_headers)

        print(res.status_code)
        
        return res.json()

    def database(self, json_data):
        uri = "mongodb+srv://srsanagala1011:1Sanagala@test.b1cuqz7.mongodb.net/?retryWrites=true&w=majority&appName=Test"
        
        client = MongoClient(uri, tlsCAFile=certifi.where())
        db = client["my_data"]
        collection = db["clothes_data"]

        if isinstance(json_data, list):
            collection.insert_many(json_data)
        else:
            collection.insert_one(json_data)






if (__name__ == '__main__'):
    test = Uniqlo()

    test.database(test.fetch())

