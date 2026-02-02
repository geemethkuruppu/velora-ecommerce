import json
import requests

try:
    response = requests.get("http://localhost:8001/api/v1/products")
    if response.status_code == 200:
        products = response.json()
        if products:
            print(json.dumps(products[0], indent=2))
        else:
            print("No products found")
    else:
        print(f"Error: {response.status_code}")
except Exception as e:
    print(f"Connection failed: {e}")
