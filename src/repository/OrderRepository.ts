import { Order } from "src/models/Order";
import { OrderFilter } from "src/models/OrderFilters";

interface OrderRepository {
    getOrder(orderId: string, customerId?: string): Promise<Order>
    getCustomerOrders(customerId: string, filterParams?: OrderFilter): AsyncIterable<Order>
    getSellerOrders(filterParams: OrderFilter): AsyncIterable<Order>
    fulfillOrder(orderId: string): Promise<Order>
}

export default OrderRepository