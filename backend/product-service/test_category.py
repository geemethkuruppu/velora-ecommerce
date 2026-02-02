import requests

url = "http://localhost:8001/api/v1/products/categories"
payload = {
    "name": "Test Menswear",
    "slug": "men-shoes",  # This should fail (already exists)
    "department": "Menswear"
}

# No admin token here yet, might fail with 401/403
# But wait, I want to see if it reaches the service
response = requests.post(url, json=payload)
print(f"Status: {response.status_code}")
print(f"Body: {response.text}")
