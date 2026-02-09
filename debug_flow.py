import requests
import random
import string
import time

BASE_URL = "http://velora-auth-alb-1482335493.ap-south-1.elb.amazonaws.com"

def random_string(length=8):
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))

def run_debug():
    print(f"Testing connectivity to {BASE_URL}...")
    
    # 1. Register
    email = f"debug_{random_string()}@test.com"
    password = "Password123!"
    print(f"\n[1] Attempting Register: {email}")
    
    try:
        reg_res = requests.post(f"{BASE_URL}/api/v1/auth/register", json={
            "email": email,
            "password": password,
            "full_name": "Debug User"
        }, timeout=10)
        print(f"Register Status: {reg_res.status_code}")
        print(f"Register Response: {reg_res.text}")
    except Exception as e:
        print(f"Register Failed: {e}")
        return

    # 2. Login
    print(f"\n[2] Attempting Login")
    try:
        login_res = requests.post(f"{BASE_URL}/api/v1/auth/login", json={
            "email": email,
            "password": password
        }, timeout=10)
        print(f"Login Status: {login_res.status_code}")
        print(f"Login Response: {login_res.text}")
        
        if login_res.status_code != 200:
            print("Login failed, stopping.")
            return

        token = login_res.json().get("access_token")
        if not token:
            print("No access token found in response!")
            return
            
        headers = {"Authorization": f"Bearer {token}"}
        print("Login Success! Token received.")
        
    except Exception as e:
        print(f"Login Failed: {e}")
        return

    # 3. Browse Products
    print(f"\n[3] Fetching Products")
    try:
        prod_res = requests.get(f"{BASE_URL}/api/v1/products", headers=headers, timeout=10)
        print(f"Products Status: {prod_res.status_code}")
        products = prod_res.json()
        print(f"Products Count: {len(products)}")
        
        if not products:
            print("No products found! Cart flow will be skipped.")
            return
            
        product = products[0]
        pid = product['id']
        vid = product['variants'][0]['id'] if product.get('variants') else None
        print(f"Selected Product: {pid}, Variant: {vid}")
        
        if not vid:
            print("Product has no variants, cant add to cart.")
            return

    except Exception as e:
        print(f"Product Fetch Failed: {e}")
        return

    # 4. Add to Cart
    print(f"\n[4] Add to Cart")
    try:
        cart_res = requests.post(f"{BASE_URL}/api/v1/cart/items", json={
            "product_id": pid,
            "variant_id": vid,
            "quantity": 1
        }, headers=headers, timeout=10)
        print(f"Cart Status: {cart_res.status_code}")
        print(f"Cart Response: {cart_res.text}")
    except Exception as e:
        print(f"Cart Add Failed: {e}")

if __name__ == "__main__":
    run_debug()
