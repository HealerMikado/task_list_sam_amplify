import logging
import boto3
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError
import os
import json

logger = logging.getLogger()
logger.setLevel(logging.INFO)
table_name = os.getenv("TASKS_TABLE")

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(table_name)

bucket = os.getenv("S3_BUCKET")
s3_client = boto3.client('s3')


def lambda_handler(event, context):
    logger.info(event)
    user = event["requestContext"]["authorizer"]["claims"]["cognito:username"]
    id = event["pathParameters"]["id"]

    logger.info(f"Deleting S3 fodler {user}/{id}")
    delete_s3_folder(bucket, f"{user}/{id}")

    logger.info(f"Deleting task: {id} for user {user}")
    data = table.delete_item(
        Key={'user' : f'user#{user}',
        "id" : f'task#{id}'}
    )
    response = {
        "statusCode": 200,
        "headers": {
            'Access-Control-Allow-Origin': '*'
        },
        "body": json.dumps(data)
    }

    logger.info(f"response from: {event['path']} statusCode: {response['statusCode']} body: {response['body']}")
    return response

def delete_s3_folder(bucket_name, folder_name):
    try : 
        response = s3_client.list_objects_v2(Bucket=bucket_name, Prefix=folder_name)
        keys = [{'Key': k['Key']} for k in response.get('Contents', [])]
        if keys :
            s3_client.delete_objects(Bucket=bucket_name, Delete={'Objects': keys})
    except ClientError as e:
        if e.response['Error']['Code'] == 'NoSuchBucket' or e.response['Error']['Code'] == 'NoSuchKey':
            print(f"{folder_name} does not exist.")
        else:
            print(f"Error deleting {folder_name}: {e}")
