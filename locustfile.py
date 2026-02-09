# Velora Load Test Script - Version 2.0 (Updated)
from locust import HttpUser, task, between, events
import random
import string
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def random_string(length=8):
    """Generate a random string for unique emails."""
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))

class VeloraUser(HttpUser):
    wait_time = between(1, 5)  # Simulate real user think time
    
    # Session Data
    token = None
    headers = {}
    user_id = None
    email = None
    cart_product_ids = []
    
    def on_start(self):
        """Lifecycle: Called when a new simulated user starts."""
        self.email = f"test_{random_string()}@locust.com"
        password = "Password123!"
        
        # 1. Register a new unique user (Auth Service)
        with self.client.post("/api/v1/auth/register", json={
            "email": self.email,
            "password": password,
            "full_name": "Locust Tester"
        }, catch_response=True) as response:
            if response.status_code != 201:
                logging.warning(f"Registration failed for {self.email}: {response.text}")
                # Fallback: Try login if user exists (rare with random email)
        
        # 2. Login to get token (Auth Service)
        response = self.client.post("/api/v1/auth/login", json={
            "email": self.email,
            "password": password
        })
        
        if response.status_code == 200:
            data = response.json()
            self.token = data["access_token"]
            self.user_id = data["user"]["id"]
            self.headers = {
                "Authorization": f"Bearer {self.token}",
                "Content-Type": "application/json"
            }
            logger.info(f"User {self.email} logged in successfully.")
        else:
            logger.error(f"Login failed for {self.email}: {response.text}")
            self.stop(force=True) # Stop this user if login fails

    # ================= PRODUCT SERVICE =================
    @task(5)
    def browse_products(self):
        """High frequency: Browse product catalog."""
        with self.client.get("/api/v1/products", name="/products (List)", headers=self.headers, catch_response=True) as response:
            if response.status_code == 200:
                products = response.json()
                if products:
                    # Pick a random product to view details
                    product = random.choice(products)
                    self.client.get(f"/api/v1/products/{product['id']}", name="/products/{id} (Detail)", headers=self.headers)
                    
                    # Store for cart actions
                    if product['variants']:
                         # Simple logic: just take first variant
                        self.cart_product_ids.append({
                            "product_id": product['id'],
                            "variant_id": product['variants'][0]['id']
                        })

    # ================= INVENTORY SERVICE =================
    @task(2)
    def check_stock(self):
        """Medium frequency: Check stock for a product."""
        if self.cart_product_ids:
            item = random.choice(self.cart_product_ids)
            # Check variant stock
            self.client.get(f"/api/v1/inventory/variant/{item['variant_id']}", name="/inventory/variant/{id}", headers=self.headers)

    # ================= CART SERVICE =================
    @task(3)
    def manage_cart(self):
        """Medium frequency: Add items to cart."""
        if self.cart_product_ids and self.token:
            item = random.choice(self.cart_product_ids)
            
            # Add to Cart
            self.client.post("/api/v1/cart/items", json={
                "product_id": item["product_id"],
                "variant_id": item["variant_id"],
                "quantity": 1
            }, name="/cart/items (Add)", headers=self.headers)
            
            # View Cart
            self.client.get("/api/v1/cart", name="/cart (View)", headers=self.headers)

    # ================= ORDER SERVICE =================
    @task(1)
    def checkout_flow(self):
        """Low frequency: Attempt checkout."""
        if self.token and self.cart_product_ids:
            # First, view cart to make sure we have something
            cart_res = self.client.get("/api/v1/cart", headers=self.headers)
            if cart_res.status_code == 200 and cart_res.json().get("items"):
                
                cart_items = cart_res.json()["items"]
                order_items = []
                for ci in cart_items:
                    order_items.append({
                        "product_id": ci["product_id"],
                        "variant_id": ci["variant_id"],
                        "quantity": ci["quantity"]
                    })
                
                # Place Order
                with self.client.post("/api/v1/orders", json={
                    "items": order_items,
                    "shipping_address": "123 Locust Stress Test Ave, Cloud City"
                }, name="/orders (Checkout)", headers=self.headers, catch_response=True) as response:
                    
                    if response.status_code == 200:
                        order_id = response.json()["id"]
                        logger.info(f"Order placed: {order_id}")
                        
                        # Verify Order History
                        self.client.get("/api/v1/orders/my", name="/orders/my (History)", headers=self.headers)
                    elif response.status_code == 400:
                        # Business logic error (e.g., out of stock) is technically a "success" for the API stress test
                        # but we can log it.
                        response.failure(response.text)

    # ================= AUTH SERVICE =================
    @task(1)
    def check_profile(self):
        """Low frequency: Check own profile."""
        if self.token:
            self.client.get("/api/v1/auth/me", name="/auth/me (Profile)", headers=self.headers)

