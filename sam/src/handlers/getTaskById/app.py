import boto3
from boto3.dynamodb.conditions import Key
import logging
import json
import os

logger = logging.getLogger()
logger.setLevel(logging.INFO)

table_name = os.gent_env("TASKS_TABLE")
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(table_name)

def lambda_handler(event, context):
    logger.info(f"event : {event}")

    user = event["requestContext"]["authorizer"]["claims"]["cognito:username"]
    id = event["pathParameters"]["id"]
    logger.info(f"Querying table {table_name}")
    data = table.query(
        KeyConditionExpression=Key('user').eq(f'user#{user}' & Key("id".eq(f'task#{id}')))
    )
    logger.info(f'Success. Item details: {data["Items"]}')

    response = {
        "statusCode": 200,
        "headers": {
        'Access-Control-Allow-Origin': '*'
        },
        "body": json.dumps(data["Item"])
    }
    
    logger.info(f'response from: ${event["path"]} statusCode: ${response["statusCode"]} body: {response["body"]}')
    return response