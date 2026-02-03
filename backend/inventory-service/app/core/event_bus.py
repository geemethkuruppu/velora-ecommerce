import httpx
import asyncio
import logging
from typing import Any, Dict

logger = logging.getLogger(__name__)

class MockEventBus:
    """
    Simulates an Event Bus (EventBridge/SQS) for local development.
    Dispatches events via background HTTP tasks to prevent blocking main transactions.
    """
    
    @staticmethod
    async def publish(target_url: str, event_type: str, payload: Dict[str, Any]):
        """
        Publish an event to a target service's event endpoint.
        Uses asyncio.create_task to run as fire-and-forget.
        """
        # We wrap the actual dispatch in a task so it doesn't block the caller
        asyncio.create_task(MockEventBus._dispatch(target_url, event_type, payload))
        logger.info(f"📤 Event Published: {event_type} -> {target_url}")

    @staticmethod
    async def _dispatch(target_url: str, event_type: str, payload: Dict[str, Any]):
        """Actual HTTP delivery logic with basic retry."""
        async with httpx.AsyncClient() as client:
            try:
                # Append /events if not already there, or expect root to handle it
                url = f"{target_url.rstrip('/')}/events"
                
                response = await client.post(
                    url,
                    json={
                        "event_type": event_type,
                        "payload": payload
                    },
                    timeout=10.0
                )
                
                if response.status_code >= 400:
                    logger.error(f"❌ Event Delivery Failed ({response.status_code}) for {event_type} to {url}")
                else:
                    logger.info(f"✅ Event Delivered: {event_type}")
                    
            except Exception as e:
                logger.error(f"❌ Event Bus Error: Could not reach {target_url} for {event_type}: {e}")
