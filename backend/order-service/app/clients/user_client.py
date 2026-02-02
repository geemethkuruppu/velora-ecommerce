import requests
from typing import Optional, List, Dict
import os

AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://localhost:8000/api/v1/auth")

class UserClient:
    @staticmethod
    def get_all_users() -> Dict[int, str]:
        """
        Fetch all users from auth service and return a map of id -> name.
        Uses admin endpoint. In real prod, this should definitely have auth headers.
        """
        try:
            # Note: This endpoint usually requires Admin auth. 
            # For this simplified setup, we might need to bypass or mock authentication 
            # OR pass a system token.
            # Assuming for now we can call it (or we mock it if auth is enforced heavily)
            # In the current setup, get_all_users in auth-service DOES require admin.
            # We will implement a 'soft' workaround or just try to call it.
            # If it fails, we fall back to placeholders.
            
            # TODO: Add proper service-to-service auth token
            response = requests.get(f"{AUTH_SERVICE_URL}/users")
            if response.status_code == 200:
                users = response.json()
                user_map = {}
                for user in users:
                    name = f"{user.get('first_name', '')} {user.get('last_name', '')}".strip()
                    if not name:
                        name = user.get('email', 'Unknown')
                    user_map[user['id']] = name
                return user_map
            return {}
        except Exception as e:
            print(f"Failed to fetch users: {e}")
            return {}
