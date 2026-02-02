import requests

# Test the transformation logic
API_URL = "http://localhost:8001/api/v1/products"

try:
    response = requests.get(API_URL, params={"department": "Womenswear"})
    if response.status_code == 200:
        products = response.json()
        
        # Simulate the frontend transformation
        API_BASE = API_URL.split('/api/v1')[0]
        IMAGE_BASE_URL = f"{API_BASE}/uploads/"
        
        print(f"API_BASE: {API_BASE}")
        print(f"IMAGE_BASE_URL: {IMAGE_BASE_URL}")
        print(f"\nFound {len(products)} products\n")
        
        for i, product in enumerate(products[:3], 1):  # Show first 3
            print(f"Product {i}: {product['name']}")
            
            # Find primary media
            primary_media = None
            if product.get('media'):
                primary_media = next((m for m in product['media'] if m.get('is_primary')), product['media'][0])
            
            if primary_media:
                media_url = primary_media['media_url']
                if media_url.startswith('http'):
                    final_url = media_url
                else:
                    final_url = f"{IMAGE_BASE_URL}{media_url}"
                
                print(f"  Media URL: {media_url}")
                print(f"  Final URL: {final_url}")
                
                # Test if the image is accessible
                img_response = requests.get(final_url)
                print(f"  Status: {img_response.status_code} ({'✓ OK' if img_response.status_code == 200 else '✗ FAILED'})")
            else:
                print(f"  No media found - will use fallback")
            
            print()
    else:
        print(f"Error: {response.status_code}")
except Exception as e:
    print(f"Connection failed: {e}")
