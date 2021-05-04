import { Order, OrderStatus } from "src/models/Order";
import OrderRepository from "src/repository/OrderRepository"
import { PayedOrderWithDynamoAnnotations, deannotate } from "src/repository/PayedOrderDynamoDB";
import UnPayedOrderWithDynamoAnnotations from "src/repository/UnPayedOrderDynamoDB";
import { DataMapper, QueryOptions, ScanOptions } from "@aws/dynamodb-data-mapper";
import { ConditionExpression, equals, greaterThanOrEqualTo, lessThanOrEqualTo, UpdateExpression } from "@aws/dynamodb-expressions";
import { DynamoDB } from "aws-sdk";
import { OrderFilter } from "src/models/OrderFilters";
import Address from "src/models/Address";
import Product from "src/models/Product";

class OrderRepositoryDynamoDB implements OrderRepository {
    readonly mapper: DataMapper;

    constructor(dynamoConnection: DynamoDB) {
        this.mapper = new DataMapper({ client: dynamoConnection })
    }

    async placeOrder(paymentID: string, addr: Address, products: Product[], customerEmail: string, customerId: string, additionalInfo: string): Promise<boolean> {
        let newOrder = new UnPayedOrderWithDynamoAnnotations(paymentID, customerEmail, customerId, addr, products, additionalInfo)
        try {
            await this.mapper.put(newOrder)
            return true
        } catch {
            return false
        }
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
    async * getCustomerOrders(customerId_: string, filterParams?: OrderFilter): AsyncIterable<Order> {
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
    async * getSellerOrders(filterParams?: OrderFilter): AsyncIterable<Order> {
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
            return deannotate(await this.mapper.executeUpdateExpression(
                fulfilled,
                { id: orderId },
                PayedOrderWithDynamoAnnotations,
                { condition: condition_ }))
        } catch (err) {
            if (err.code && err.code === 'ConditionalCheckFailedException')
                return undefined;
            throw err
        }
    }

    async moveToPayedOrders(paymentId: string): Promise<boolean> {
        try {
            const o = await this.mapper.get(new UnPayedOrderWithDynamoAnnotations(paymentId))
            const o2 = new PayedOrderWithDynamoAnnotations("", o.customerId, o.customerEmail, o.address, o.products, o.additionalInfo);
            await this.mapper.put(o2);
            await this.mapper.delete(o)
            return true
        } catch (err) {
            if (err.name && err.name === 'ItemNotFoundException')
                return false;
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