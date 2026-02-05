import json
import sys

try:
    with open('cf_dist.json', 'r', encoding='utf-16') as f:
        data = json.load(f)
except:
    try:
        with open('cf_dist.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
    except:
        print("Failed to read file")
        sys.exit(1)

for item in data['DistributionList']['Items']:
    # Print all origins to see what we have
    origins = [o['DomainName'] for o in item['Origins']['Items']]
    print(f"Origins: {origins} -> ID: {item['Id']}")
