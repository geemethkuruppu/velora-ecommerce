import re

def sanitize_string(value: str) -> str:
    """
    Remove HTML tags from a string to prevent XSS.
    """
    if value is None:
        return None
    # Remove HTML tags
    clean = re.sub(r'<[^>]*>', '', value)
    # Trim whitespace
    return clean.strip()
