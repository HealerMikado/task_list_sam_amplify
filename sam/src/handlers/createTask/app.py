import boto3
import uuid
import os
import logging
import json
from datetime import datetime

table_name = os.getenv("TASKS_TABLE")

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(table_name)

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def lambda_handler(event, context):
    logger.info("receive", event)

    body = json.loads(event["body"])
    user = event["requestContext"]["authorizer"]["claims"]["cognito:username"]
    id = uuid.uuid4()
    title = body["title"]
    body_text = body["body"]
    created_at = datetime.now().isoformat()

    due_date = created_at
    if ('dueDate' in body):
        due_date = body["dueDate"]

    logger.info(f"Writing data to table {table_name}")
    data = table.put_item(
        Item={
            "user": f"user#{user}",
            "id": f"task#{id}",
            "title": title,
            "body": body_text,
            "dueDate": due_date,
            "createdAt": created_at
        })
    logger.info(f'Success - item added or updated {data}')

    response = {
        "statusCode": 201,
        "headers": {
            'Access-Control-Allow-Origin': '*'
        },
        "body": json.dumps(data)
    }

    return response
