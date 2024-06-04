import requests
import os
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import certifi
from dotenv import load_dotenv

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
        print("Fetching Uniqlo Data")
        res = self.client.get("https://www.uniqlo.com/sg/api/commerce/v3/en/products?path=%2C%2C25596&limit=50&offset=0", headers=self.custom_headers)

        print(res.status_code)
        
        return res.json()

    def clean(self, json_data):
        print("Cleaning Uniqlo Data")
        data = json_data['result']['items']

        clean_data = []
        colors = json_data['result']['aggregations']['colors']

        for item in data:

            price_lookup = 'base'
            
            if item['prices']['base'] == None:
                price_lookup = 'promo'
            
            clean_data.append({

                'productID': item['productId'],
                'name': item['name'],
                'price': [item['prices'][price_lookup]['currency']['symbol'], item['prices'][price_lookup]['value']],
                'image': item['images']['main'],
                'gender': item['genderName'],
                'sizes': item['sizes'],
                'rating': item['rating'],
                'brand': 'Uniqlo'
            
            })


        send_data = []

        send_data.append({
            'data': clean_data,
            'colors': colors
        })        
   
        return send_data

    def database(self, json_data):
        print("Connecting to MongoDB")
        
        load_dotenv()
        uri = os.getenv("MONGODB_API")

        client = MongoClient(uri, tlsCAFile=certifi.where())
        db = client["my_data"]
        collection = db["uniqlo_men_tops"]

        if isinstance(json_data, list):
            collection.insert_many(json_data)
            print('hi')
        else:
            collection.insert_one(json_data)
            print('hey')
        
        print("Data Inserted")






if (__name__ == '__main__'):
    test = Uniqlo()

    test.database(test.clean(test.fetch()))

