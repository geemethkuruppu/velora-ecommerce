import boto3
import json

def get_distribution_id(domain_name):
    client = boto3.client('cloudfront')
    paginator = client.get_paginator('list_distributions')
    
    for page in paginator.paginate():
        if 'Items' in page['DistributionList']:
            for dist in page['DistributionList']['Items']:
                if domain_name in dist['DomainName']:
                    return dist['Id']
    return None

if __name__ == "__main__":
    target_domain = "d2dnnb0ijn36mw.cloudfront.net"
    dist_id = get_distribution_id(target_domain)
    if dist_id:
        print(f"FOUND_ID: {dist_id}")
    else:
        print("ID_NOT_FOUND")
