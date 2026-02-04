import requests
from typing import Optional, List, Dict
import os
import logging
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

logger = logging.getLogger(__name__)

from app.core.config import settings
AUTH_SERVICE_URL = settings.auth_service_url
from app.core.logging_utils import correlation_id_ctx

def get_headers():
    return {"X-Correlation-ID": correlation_id_ctx.get() or ""}

class UserClient:
    @staticmethod
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((requests.exceptions.ConnectionError, requests.exceptions.Timeout, requests.exceptions.HTTPError)),
        reraise=False
    )
    def get_all_users() -> Dict[int, str]:
        """
        Fetch all users from auth service and return a map of id -> name.
        Uses admin endpoint. In real prod, this should definitely have auth headers.
        """
        try:
            # TODO: Add proper service-to-service auth token
            response = requests.get(
                f"{AUTH_SERVICE_URL}/users",
                headers=get_headers(),
                timeout=5.0
            )
            
            # Raise for transient errors to trigger retry
            if response.status_code in [502, 503, 504]:
                response.raise_for_status()

            if response.status_code == 200:
                users = response.json()
                user_map = {}
                for user in users:
                    name = user.get('full_name') or user.get('email', 'Unknown')
                    user_map[user['id']] = name
                return user_map
            return {}
        except (requests.exceptions.ConnectionError, requests.exceptions.Timeout) as e:
            logger.error(f"Transient error fetching users: {e}. Retrying...")
            raise
        except Exception as e:
            logger.error(f"Failed to fetch users: {e}")
            return {}
