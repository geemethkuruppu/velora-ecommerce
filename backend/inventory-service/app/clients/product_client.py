import requests
from typing import Optional, List, Dict
import os

PRODUCT_SERVICE_URL = os.getenv("PRODUCT_SERVICE_URL", "http://127.0.0.1:8001/api/v1/products")

class ProductClient:
    @staticmethod
    def get_all_products() -> Dict[int, str]:
        """
        Fetch all products from product service and return a map of variant_id -> product_name.
        Since product service returns products with variants list, we flatten it.
        """
        try:
            # We can use list_all products endpoint
            response = requests.get(f"{PRODUCT_SERVICE_URL}")
            if response.status_code == 200:
                products = response.json()
                variant_map = {}
                for product in products:
                    p_name = product.get('name', 'Unknown')
                    variants = product.get('variants', [])
                    for variant in variants:
                        # variant_id -> "Product Name" (or "Product Name - Variant Name" if desired)
                        # User asked for "Original main product name" under the SKU
                        # So we map variant_id -> product_name
                        variant_map[variant['id']] = p_name
                return variant_map
            return {}
        except Exception as e:
            print(f"Failed to fetch products: {e}")
            return {}
