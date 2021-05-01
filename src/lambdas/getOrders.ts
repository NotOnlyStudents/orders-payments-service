import OrderResponse from "src/models/OrderResponse"
import OrderRepository from "src/repository/OrderRepository"
import OrderFilter from "src/models/OrderFilters"
import { Order } from "src/models/Order"

const lambda = async (repo: OrderRepository, filter: OrderFilter, customerId: string = ""): Promise<OrderResponse> => {
    if (customerId !== "" && filter.email)
        return new OrderResponse(400)
    let orders: Order[] = []
    const queryResult = customerId === "" ? repo.getSellerOrders(filter) : repo.getCustomerOrders(customerId, filter);
    for await (const order of queryResult) {
        orders.push(order)
    }
    return new OrderResponse(200, orders)
}
export default lambda