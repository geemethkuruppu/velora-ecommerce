from locust import HttpUser, task, between

class WebsiteUser(HttpUser):
    wait_time = between(1, 5)

    # 1. First, we need to login to get a token
    def on_start(self):
        # Login as the immutable admin user for testing
        response = self.client.post("/api/v1/auth/login", data={
            "username": "admin@velora.com",
            "password": "adminpassword"
        })
        if response.status_code == 200:
            self.token = response.json()["access_token"]
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            self.token = None
            self.headers = {}

    @task(3)
    def view_products(self):
        # Simulating heavy read traffic
        self.client.get("/api/v1/products", headers=self.headers)

    @task(1)
    def view_cart(self):
        # Simulating user checking cart
        if self.token:
            self.client.get("/api/v1/cart", headers=self.headers)

    @task(1)
    def check_health(self):
        # Heartbeat check
        self.client.get("/health")
