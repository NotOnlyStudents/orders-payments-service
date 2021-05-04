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
import processPaymentOutcome from "src/lambdas/processPaymentOutcome"
import PaymentResponse from "src/models/PaymentResponse"
import { PaymentEvent } from "src/models/PaymentEvent";

const handler: Handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const dynamoConfig: ClientConfiguration = parseDocument(readFile(process.env.DYNAMODB_CONFIG_FILE_PATH, 'utf-8')).toJSON()
    const repo = new OrderRepositoryDynamoDB(new DynamoDB(dynamoConfig))
    let paymentEvent: PaymentEvent
    try {
        paymentEvent = JSON.parse(event.body)
    } catch {
        return new PaymentResponse(400);
    }
    return processPaymentOutcome(repo, paymentEvent)
}

export default handler