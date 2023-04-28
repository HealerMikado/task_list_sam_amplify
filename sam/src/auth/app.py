import jwt
import logging
from datetime import datetime
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def python_handler(event, context):
    logger.info(event)
    token = event["authorizationToken"].split(' ')[1]
    try :
        verified_jwt = jwt.decode(token, "secretphrase", algorithms=['HS256'] )
        logger.info(f"verified token {verified_jwt }")
        resource = '/'.join(event['methodArn'].split('/', 2)[:2]) + '/*'
        print(resource)
        policy = generate_policy(verified_jwt['sub'], 'Allow', resource)
        logger.info(f'Generated policy: {policy}')
    except Exception as err:
        logger.error(err)
    return policy


def generate_policy(principal_id, effect, resource):
    auth_response = {}
    auth_response['principalId'] = principal_id
    if effect and resource:
        policy_document = {}
        policy_document['Version'] = '2012-10-17'
        policy_document['Statement'] = []
        statement_one = {}
        statement_one['Action'] = 'execute-api:Invoke'
        statement_one['Effect'] = effect
        statement_one['Resource'] = resource
        policy_document['Statement'].append(statement_one)
        auth_response['policyDocument'] = policy_document

    auth_response['context'] = {
        'userId': 1,
        'createdAt': datetime.now().isoformat()
    }
    return auth_response