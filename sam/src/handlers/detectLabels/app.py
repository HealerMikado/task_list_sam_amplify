import boto3
import os
import logging
import json
from datetime import datetime
from urllib.parse import unquote_plus

table_name = os.getenv("TASKS_TABLE")

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(table_name)

reckognition = boto3.client('rekognition')

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def lambda_handler(event, context):
    logger.info(json.dumps(event, indent=2))
    bucket = event["Records"][0]["s3"]["bucket"]["name"]
    key = unquote_plus(event["Records"][0]["s3"]["object"]["key"])

    user, task_id = key.split('/')[:2]
    try:
        logger.info(f'Saving upload for task ${task_id}: s3://{bucket}/{key}')
        table.update_item(
            Key={
                "user": f"user#{user}",
                "id": f"task#{task_id}"
            },
            AttributeUpdates={
                "upload": {
                    "Value": f"s3://{bucket}/{key}",
                    "Action": "PUT"
                }
            },
            ReturnValues='UPDATED_NEW'
        )

    except Exception as e:
        logger.error(f"Unable to update item. Error {e}")
        raise e

    label_data = reckognition.detect_labels(
        Image={
            "S3Object": {
                "Bucket": bucket,
                "Name": key
            }
        },
        MaxLabels=5,
        MinConfidence=0.75
    )
    logger.info(f"Labels data : {label_data}")

    labels = [label["Name"] for label in label_data["Labels"]]

    logger.info(f"Labels detected : {labels}")

    try:
        logger.info(f'Saving labels for task ${task_id}: ${labels}')
        table.update_item(
            Key={
                "user": f"user#{user}",
                "id": f"task#{task_id}"
            },
            AttributeUpdates={
                "labels": {
                    "Value": labels,
                    "Action": "PUT"
                }
            },
            ReturnValues='UPDATED_NEW'
        )

    except Exception as e:
        logger.error(f"Unable to update item. Error {e}")
        raise e

    response = {
        "statusCode": 200,
        "headers": {
            'Access-Control-Allow-Origin': '*'
        },
        "body": json.dumps(labels)
    }
    return response
