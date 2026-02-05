# Serverless Image Resizer (AWS Lambda)

This function automatically generates thumbnails when a new image is uploaded to the Product S3 Bucket.

## 1. Setup Instructions
1.  **Zip the Code**:
    ```bash
    zip function.zip lambda_function.py
    ```
    *(Note: You need to install `Pillow` in a target folder and zip it with the function if using raw Python, or use a Lambda Layer)*.

2.  **Create Lambda Function**:
    - Runtime: Python 3.9
    - Handler: `lambda_function.lambda_handler`
    - Role: Standard Execution Role + `S3FullAccess` (or scoped policy).

3.  **Add Trigger**:
    - Source: S3
    - Bucket: `velora-product-images`
    - Event: `Post` / `Put`
    - Prefix: `products/` (Avoid recursion!)

## 2. Testing
Upload an image to the `products/` folder in S3. Checks logs in CloudWatch. You should see a new file appear in `thumbnails/`.
