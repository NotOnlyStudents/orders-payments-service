import { Order, OrderStatus } from "src/models/Order";
import OrderRepository from "src/repository/OrderRepository"
import { PayedOrderWithDynamoAnnotations, deannotate } from "src/repository/PayedOrderDynamoDB";
import { DataMapper, QueryOptions, ScanOptions, UpdateOptions } from "@aws/dynamodb-data-mapper";
import { ConditionExpression, equals, greaterThanOrEqualTo, lessThanOrEqualTo, UpdateExpression } from "@aws/dynamodb-expressions";
import { DynamoDB } from "aws-sdk";
import { OrderFilter } from "src/models/OrderFilters";

class OrderRepositoryDynamoDB implements OrderRepository {
    readonly mapper: DataMapper;

    constructor(dynamoConnection: DynamoDB) {

        this.mapper = new DataMapper({ client: dynamoConnection })
    }

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
    async *getCustomerOrders(customerId_: string, filterParams?: OrderFilter): AsyncIterable<Order> {
        let scanParams: QueryOptions = { indexName: "userIdIndex" }
        if (!isEmpty(filterParams)) {
            const filterExpression = toConditionExpression(filterParams);
            scanParams.filter = filterExpression;
        }
        const annotatedResult = this.mapper.query(PayedOrderWithDynamoAnnotations, { customerId: customerId_ }, scanParams)
        for await (const elem of annotatedResult) {
            yield deannotate(elem)
        }
    }
    async *getSellerOrders(filterParams?: OrderFilter): AsyncIterable<Order> {
        let scanParams: ScanOptions = {}
        if (!isEmpty(filterParams)) {
            const filterExpression = toConditionExpression(filterParams);
            scanParams = { filter: filterExpression }
        }
        const annotatedResult = this.mapper.scan(PayedOrderWithDynamoAnnotations, scanParams)
        for await (const elem of annotatedResult) {
            yield deannotate(elem)
        }
    }

    async fulfillOrder(orderId: string): Promise<Order> {
        let fulfilled = new UpdateExpression()
        fulfilled.set('status', OrderStatus.fulfilled)
        const condition_: ConditionExpression = { ...equals(orderId), subject: 'id' }
        try {
            return await this.mapper.executeUpdateExpression(
                fulfilled,
                { id: orderId },
                PayedOrderWithDynamoAnnotations,
                { condition: condition_ }
            )
        } catch (err) {
            if (err.code && err.code === 'ConditionalCheckFailedException')
                return undefined;
            throw err
        }
    }
}


function isEmpty(obj: object): boolean {
    return Object.keys(obj).length === 0
}

const toConditionExpression = (filter: OrderFilter): ConditionExpression => {
    let conditions_ = []
    if (filter.email)
        conditions_.push({ ...equals(filter.email), subject: "customerEmail" })
    if (filter.status)
        conditions_.push({ ...equals(filter.status), subject: "status" })
    if (filter.start)
        conditions_.push({
            ...greaterThanOrEqualTo(filter.start.getTime()),
            subject: "numberDate"
        })
    if (filter.end)
        conditions_.push({
            ...lessThanOrEqualTo(filter.end.getTime()),
            subject: "numberDate"
        })

    return {
        type: "And",
        conditions: conditions_
    }
}

export default OrderRepositoryDynamoDB