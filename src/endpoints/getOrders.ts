import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from 'aws-lambda';
import OrderRepositoryDynamoDB from 'src/repository/OrderRepositoryDynamoDB';
import { parseDocument } from 'yaml';
import { DynamoDB } from 'aws-sdk';
import { ClientConfiguration } from 'aws-sdk/clients/dynamodb';
import { readFileSync as readFile } from 'fs';
import getOrders from 'src/lambdas/getOrders';
import { OrderFilter } from 'src/models/OrderFilters';

const handler: Handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const dynamoConfig: ClientConfiguration = parseDocument(readFile(process.env.DYNAMODB_CONFIG_FILE_PATH, 'utf-8')).toJSON();
  const repo = new OrderRepositoryDynamoDB(new DynamoDB(dynamoConfig));
  // const userName = event.requestContext.authorizer.claims['cognito:username'] as string
  // const userGroups = event.requestContext.authorizer.claims['cognito:groups'] as string[]
  // if (userGroups.includes("buyers"))
  const filters: OrderFilter = { ...event.queryStringParameters };
  return getOrders(repo, filters);
  // else if (userGroups.includes("sellers"))
};

export default handler;
