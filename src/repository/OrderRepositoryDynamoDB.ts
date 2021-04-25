import { Order } from "src/models/Order";
import OrderRepository from "src/repository/OrderRepository"
import { PayedOrderWithDynamoAnnotations, deannotate } from "src/repository/PayedOrderDynamoDB";
import { DataMapper, GetOptions } from "@aws/dynamodb-data-mapper";
import { DynamoDB } from "aws-sdk";

class OrderRepositoryDynamoDB implements OrderRepository {
    readonly mapper: DataMapper;
    async getOrder(orderId: string, customerId: string = ""): Promise<Order> {
        let annotatedResult: PayedOrderWithDynamoAnnotations
        try {
            annotatedResult = await this.mapper.get(new PayedOrderWithDynamoAnnotations(orderId))
        } catch (err) {
            if (err.name && err.name === 'ItemNotFoundException')
                return undefined;
            throw err
        }
        if (customerId !== "" && annotatedResult.customerId !== customerId)
            return undefined;
        return deannotate(annotatedResult)
    }
    async *getCustomerOrders(customerId_: string, _filterParams?: object): AsyncIterable<Order> {
        const annotatedResult = this.mapper.query(PayedOrderWithDynamoAnnotations, { customerId: customerId_ })
        for await (const elem of annotatedResult) {
            yield deannotate(elem)
        }
    }
    async *getSellerOrders(_filterParams?: object): AsyncIterable<Order> {
        const annotatedResult = this.mapper.scan(PayedOrderWithDynamoAnnotations)
        for await (const elem of annotatedResult) {
            yield deannotate(elem)
        }
    }
    constructor(dynamoConnection: DynamoDB) {
        this.mapper = new DataMapper({ client: dynamoConnection })
    }
}

export default OrderRepositoryDynamoDB