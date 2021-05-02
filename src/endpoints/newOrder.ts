import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
    Handler
} from "aws-lambda"
import OrderRepositoryDynamoDB from "src/repository/OrderRepositoryDynamoDB"
import { parseDocument } from "yaml"
import { DynamoDB, } from "aws-sdk"
import { ClientConfiguration } from "aws-sdk/clients/dynamodb"
import { readFileSync as readFile } from 'fs'
import newOrder from "src/lambdas/newOrder"
import { OrderFilter } from "src/models/OrderFilters"
import PaymentResponse from "src/models/PaymentResponse"

const handler: Handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const dynamoConfig: ClientConfiguration = parseDocument(readFile(process.env.DYNAMODB_CONFIG_FILE_PATH, 'utf-8')).toJSON()
    const repo = new OrderRepositoryDynamoDB(new DynamoDB(dynamoConfig))
    // const userName = event.requestContext.authorizer.claims['cognito:username'] as string
    // const userGroups = event.requestContext.authorizer.claims['cognito:groups'] as string[]
    // if (userGroups.includes("buyers"))
    let body
    try {
        body = JSON.parse(event.body)
    } catch {
        return new PaymentResponse(400);
    }
    return newOrder(repo,
        body["cart-token"],
        body.address,
        "leonardo.tredese@studenti.unipd.it",
        "6a7b0db0-65ce-4864-b661-ecf424124cd3",
        body.additionalInfo)
    // else if (userGroups.includes("sellers"))
}

export default handler