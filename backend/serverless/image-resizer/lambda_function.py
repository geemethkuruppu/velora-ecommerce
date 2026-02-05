import boto3
import os
import sys
import uuid
from urllib.parse import unquote_plus
from PIL import Image
import io

s3_client = boto3.client('s3')

def resize_image(image_path, resized_path):
    with Image.open(image_path) as image:
        image.thumbnail((200, 200))
        image.save(resized_path)

def lambda_handler(event, context):
    """
    Triggered by S3 Object Created Event.
    Generates a thumbnail for the uploaded image.
    """
    for record in event['Records']:
        bucket = record['s3']['bucket']['name']
        key = unquote_plus(record['s3']['object']['key'])
        
        # Check if it is already a thumbnail to avoid infinite loops
        if "thumbnail-" in key:
            print("Skipping thumbnail file.")
            continue
            
        print(f"Processing {key} from {bucket}")
        
        tmpkey = key.replace('/', '')
        download_path = '/tmp/{}{}'.format(uuid.uuid4(), tmpkey)
        upload_path = '/tmp/resized-{}'.format(tmpkey)
        
        s3_client.download_file(bucket, key, download_path)
        resize_image(download_path, upload_path)
        
        # Upload to a 'thumbnails/' prefix
        new_key = "thumbnails/thumbnail-{}".format(key.split('/')[-1])
        s3_client.upload_file(upload_path, bucket, new_key)
        
        print(f"Thumbnail uploaded to {new_key}")
        
    return {
        'statusCode': 200,
        'body': 'Thumbnail generation successful'
    }
