import { Order } from "src/models/Order";
import OrderRepository from "src/repository/OrderRepository"
import { PayedOrderWithDynamoAnnotations, deannotate } from "src/repository/PayedOrderDynamoDB";
import { DataMapper, ScanOptions } from "@aws/dynamodb-data-mapper";
import { ConditionExpression, equals, greaterThanOrEqualTo, lessThanOrEqualTo } from "@aws/dynamodb-expressions";
import { DynamoDB } from "aws-sdk";
import OrderFilter from "src/models/OrderFilters";
import { fileURLToPath } from "url";

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
    async *getCustomerOrders(customerId_: string, filterParams?: OrderFilter): AsyncIterable<Order> {
        const filterExpression = toConditionExpression(filterParams);
        const annotatedResult = this.mapper.query(PayedOrderWithDynamoAnnotations, { customerId: customerId_ }, { filter: filterExpression, indexName: "userIdIndex" })
        for await (const elem of annotatedResult) {
            yield deannotate(elem)
        }
    }
    async *getSellerOrders(filterParams?: object): AsyncIterable<Order> {
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
    constructor(dynamoConnection: DynamoDB) {
        this.mapper = new DataMapper({ client: dynamoConnection })
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