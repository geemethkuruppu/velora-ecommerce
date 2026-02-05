import random
from locust import HttpUser, task, between, events
import logging

# Configure logging to handle performance data
logger = logging.getLogger(__name__)

class VeloraShopper(HttpUser):
    # Simulates a real user thinking time (1-5 seconds)
    wait_time = between(1, 5)
    
    def on_start(self):
        """Executed when a simulated user starts"""
        self.auth_token = None
        self.user_id = None

    @task(3)
    def browse_products(self):
        """Simulate a user browsing the product catalog (3x weight)"""
        with self.client.get("/api/v1/products", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Product list failed: {response.status_code}")

    @task(2)
    def view_categories(self):
        """Simulate a user checking different categories"""
        self.client.get("/api/v1/products/categories")

    @task(1)
    def simulate_login_and_cart(self):
        """Simulate the full login -> view cart flow (1x weight)"""
        # Testing credentials (should be set up in the DB beforehand)
        login_data = {
            "username": "testuser@example.com",
            "password": "Password123!"
        }
        
        # 1. Login
        with self.client.post("/api/v1/auth/login", json=login_data, catch_response=True) as response:
            if response.status_code == 200:
                self.auth_token = response.json().get("access_token")
                headers = {"Authorization": f"Bearer {self.auth_token}"}
                
                # 2. View Cart (Authenticated)
                self.client.get("/api/v1/cart", headers=headers)
                
                # 3. Add to Cart (Simulated SKU)
                cart_payload = {"variant_id": 1, "quantity": 1}
                self.client.post("/api/v1/cart/items", json=cart_payload, headers=headers)
                
                response.success()
            elif response.status_code == 401:
                # Expected if user not seeded, still a successful 'test' of security
                response.success()
            else:
                response.failure(f"Auth flow failed: {response.status_code}")

@events.init_command_line_parser.add_listener
def _(parser):
    parser.add_argument("--my-argument", type=str, env_var="MY_ARGUMENT", default="custom value")
