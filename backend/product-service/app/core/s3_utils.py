import boto3
from botocore.exceptions import ClientError
from app.core.config import settings
import logging
from urllib.parse import urlparse

logger = logging.getLogger(__name__)

def delete_s3_object(url: str):
    """
    Deletes an object from S3 given its full URL.
    Extracts the key from the URL and uses the configured bucket/region.
    """
    if not url or "amazonaws.com" not in url:
        logger.warning(f"Skipping S3 deletion for non-S3 URL: {url}")
        return False

    try:
        # Extract key from URL
        # Example: https://bucket.s3.region.amazonaws.com/products/file.jpg
        # Example: https://s3.region.amazonaws.com/bucket/products/file.jpg
        parsed_url = urlparse(url)
        path = parsed_url.path
        
        # If the bucket is in the domain, the path is the key
        # If the bucket is the first part of the path, we need to strip it
        if parsed_url.netloc.split('.')[0] == settings.s3_bucket_name:
            key = path.lstrip('/')
        else:
            # Format: s3.region.amazonaws.com/bucket/key
            path_parts = path.lstrip('/').split('/')
            if path_parts[0] == settings.s3_bucket_name:
                key = '/'.join(path_parts[1:])
            else:
                key = path.lstrip('/') # Fallback

        s3_client = boto3.client('s3', region_name=settings.aws_region)
        s3_client.delete_object(Bucket=settings.s3_bucket_name, Key=key)
        logger.info(f"Successfully deleted S3 object: {key}")
        return True
    except ClientError as e:
        logger.error(f"Failed to delete S3 object {url}: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error deleting S3 object {url}: {str(e)}")
        return False
