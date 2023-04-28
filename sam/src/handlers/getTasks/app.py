import logging
import boto3
from boto3.dynamodb.conditions import Key
import os
import json

logger = logging.getLogger()
logger.setLevel(logging.INFO)
table_name = os.getenv("TASKS_TABLE")

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(table_name)

def lambda_handler(event, context):
    logger.info(event)
    user = event["requestContext"]["authorizer"]["claims"]["cognito:username"]
    logger.info(f"Querying table {table_name}")
    data = table.query(
        KeyConditionExpression=Key('user').eq(f'user#{user}')
    )
    logger.info(f'Success. Item details: {data["Items"]}')

    response = {
        "statusCode": 200,
        "headers": {
            'Access-Control-Allow-Origin': '*'
        },
        "body": json.dumps(data["Items"])
    }

    logger.info(f"response from: {event['path']} statusCode: {response['statusCode']} body: {response['body']}")
    return response