import requests
import os
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import certifi
import html2text
from dotenv import load_dotenv

class Uniqlo:
    def __init__(self) -> None:
        self.client = requests.Session()
        
        self.custom_headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:99.0) Gecko/20100101 Firefox/99.0",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        }

        self.links = [
            "https://www.uniqlo.com/sg/api/commerce/v3/en/products?path=%2C%2C25596&limit=50&offset=0", 
            "https://www.uniqlo.com/sg/api/commerce/v3/en/products?path=%2C%2C25523&limit=50&offset=0"
        ]
        self.collections = [
            "uniqlo_men_tops", 
            "uniqlo_women_tops"
        ]

    def fetch(self, link):
        print("Fetching Uniqlo Data")
        try:
            res = self.client.get(link, headers=self.custom_headers)
            res.raise_for_status()
            print(res.status_code)
            return res.json()
        except requests.exceptions.RequestException as e:
            print(f"Error fetching data: {e}")
            return None
        

    
    def clean(self, json_data):
        if json_data is None:
            return None
        def html_to_text(html_content):
            h = html2text.HTML2Text()
            h.ignore_links = True
            h.ignore_images = True
            return h.handle(html_content)
            
        print("Cleaning Uniqlo Data")
        data = json_data["result"]["items"]
        colors = json_data["result"]["aggregations"]["colors"]

        clean_data = []
        
        for item in data:
            price_lookup = "base" if item["prices"]["base"] is not None else "promo"
            
            sizes = [size["name"] for size in item["sizes"]]
            imgs = item["images"]["main"]
            seen = {}
            images = []
            for idx in range(len(imgs)):
                colorCode = imgs[idx]["colorCode"]
                colorString = ""
                for c in colors:
                    if c["displayCode"] == colorCode:
                        colorString = c["name"]
                        break
                
                if colorString != "":
                    if colorString not in seen:
                        seen[colorString] = colorString
                        content = {
                            "url": imgs[idx]["url"],
                            "colorString": colorString
                        }

                        images.append(content)
            
            clean_data.append({
                "productID": item["productId"],
                "name": item["name"],
                "price": [item["prices"][price_lookup]["currency"]["symbol"], item["prices"][price_lookup]["value"]],
                "image": images,
                "gender": item["genderName"],
                "sizes": sizes,
                "rating": item["rating"],
                "brand": "Uniqlo",
                "longDescription": html_to_text(item["longDescription"]),
                "composition": item["composition"],
            })

        return {"clothes_data": clean_data}

    def database(self, json_data, collection_name):
        if json_data is None:
            print("No data to insert into the database.")
            return
        
        print("Connecting to MongoDB")
        
        load_dotenv()
        uri = os.getenv("MONGODB_API")

        try:
            client = MongoClient(uri, tlsCAFile=certifi.where())
            db = client["my_data"]
            collection = db[collection_name]

            if isinstance(json_data, list):
                collection.insert_many(json_data)
                print("Inserted multiple documents")
            else:
                collection.insert_one(json_data)
                print("Inserted one document")
        
            print("Data Inserted")
        except Exception as e:
            print(f"Error connecting to MongoDB: {e}")

class LoveBonito:
    def __init__(self) -> None:
        self.client = requests.Session()
        
        self.custom_headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:99.0) Gecko/20100101 Firefox/99.0",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        }

        self.links = [
            "https://www.lovebonito.com/api/ext/es-catalog/catalog/getProducts?urlKey=shop%252Fapparel-accessories%252Ftops&count=40&stock.is_in_stock=true&agg=true&storeCode=sg", 
        ]
        self.collections = [
            "lovebonito_women_tops"
        ]
    
    def fetch(self, link):
        print("Fetching LoveBonito Data")
        try:
            res = self.client.get(link, headers=self.custom_headers)
            res.raise_for_status()
            print(res.status_code)
            return res.json()
        except requests.exceptions.RequestException as e:
            print(f"Error fetching data: {e}")
            return None
    
    def clean(self, json_data):
        if json_data is None:
            return None
            
        print("Cleaning LoveBonito Data")
        data = json_data["result"]["hits"]["hits"]

        clean_data = []
        
        for item in data:
            
            clothing_data = item["_source"]
            options = clothing_data["configurable_options"]
            
            size_options = [option["values"] for option in options if option["attribute_code"] == "size"][0]
            sizes = [size["label"] for size in size_options]
            
            colors = [option["values"] for option in options if option["attribute_code"] == "color"][0]

            seen = {}
            img_url = "https://public-images-for-media.s3.ap-southeast-1.amazonaws.com/media/catalog/product"
            imgs = clothing_data["configurable_children"]
            for i in imgs:
                if i["color"] not in seen:
                    seen[i["color"]] = img_url+i["image"]
            
                    
            images = []
            for i in seen.keys():
                color = [c["label"] for c in colors if c["value_index"] == str(i)][0]
                
                images.append({
                    "url": seen[i],
                    "colorString": color,
                
                })
            

            
            clean_data.append({
                "productID": item["_id"],
                "name": clothing_data["name"],
                "price": ["S$", str(clothing_data["price"])],
                "image": images,
                "gender": "Women",
                "sizes": sizes,
                "rating": "",
                "brand": "LoveBonito",
                "longDescription": "",
                "composition": "",
            })
        
        return {"clothes_data": clean_data}
    
    def database(self, json_data, collection_name):
        if json_data is None:
            print("No data to insert into the database.")
            return
        
        print("Connecting to MongoDB")
        
        load_dotenv()
        uri = os.getenv("MONGODB_API")

        try:
            client = MongoClient(uri, tlsCAFile=certifi.where())
            db = client["my_data"]
            collection = db[collection_name]

            if isinstance(json_data, list):
                collection.insert_many(json_data)
                print("Inserted multiple documents")
            else:
                collection.insert_one(json_data)
                print("Inserted one document")
        
            print("Data Inserted")
        except Exception as e:
            print(f"Error connecting to MongoDB: {e}")
        

if __name__ == "__main__":
    
    uniqlo = Uniqlo()
    for i in range(len(uniqlo.links)):
        print(f"Fetching Data for {uniqlo.collections[i]}")
        fetched_data = uniqlo.fetch(uniqlo.links[i])
        cleaned_data = uniqlo.clean(fetched_data)
        uniqlo.database(cleaned_data, uniqlo.collections[i])
    
    '''
    lovebonito = LoveBonito()
    for i in range(len(lovebonito.links)):
        print(f"Fetching Data for {lovebonito.collections[i]}")
        fetched_data = lovebonito.fetch(lovebonito.links[i])
        cleaned_data = lovebonito.clean(fetched_data)
        lovebonito.database(cleaned_data, lovebonito.collections[i])
    '''

