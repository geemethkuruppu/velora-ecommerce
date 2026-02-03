import os 
import sys


BASE_STRUCTURE = [
    "app",
    "app/api",
    "app/api/v1",
    "app/core",
    "app/models",
    "app/schemas",
    "app/services",
    "app/db",
    "tests"
]


FILES = [
    "app/main.py",
    "app/api/v1/auth.py",
    "app/core/config.py",
    "app/core/security.py",
    "app/models/user.py",
    "app/schemas/user.py",
    "app/services/auth_service.py",
    "app/db/base.py",
    "app/db/session.py",
    "requirements.txt",
    ".env",
    ".env.example",
    "Dockerfile"
]


def create_service(service_name):
    service_path = os.path.join(os.getcwd(), service_name)

    if os.path.exists(service_path):
        print(f"Error: Directory '{service_name}' already exists.")
        return
    
    for folder in BASE_STRUCTURE:
        os.makedirs(os.path.join(service_path, folder), exist_ok=True)

    for file in FILES:
        file_path = os.path.join(service_path, file)
        open(file_path, 'a').close()

    print(f"Service '{service_name}' created successfully at {service_path}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python create_service.py <service_name>")
        sys.exit(1)

    service_name = sys.argv[1]
    create_service(service_name)
