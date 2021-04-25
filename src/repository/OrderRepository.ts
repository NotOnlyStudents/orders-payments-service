import { Order } from "src/models/Order";

interface OrderRepository {
    getOrder(orderId: string, customerId?: string): Promise<Order>
    getCustomerOrders(customerId: string, filterParams?: object): AsyncIterable<Order>
    getSellerOrders(filterParams): AsyncIterable<Order>
}

export default OrderRepository