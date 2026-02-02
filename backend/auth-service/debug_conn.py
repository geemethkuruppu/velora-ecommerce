import socket
import os
from dotenv import load_dotenv

load_dotenv()

host = os.getenv("DB_HOST")
port = os.getenv("DB_PORT", "5432")

print(f"Testing connection to {host}:{port}...")

if not host:
    print("Error: DB_HOST not found in environment.")
    exit(1)

try:
    s = socket.create_connection((host, int(port)), timeout=10)
    print("Success: Connection established!")
    s.close()
except socket.timeout:
    print("Error: Connection timed out.")
except Exception as e:
    print(f"Error: {e}")
