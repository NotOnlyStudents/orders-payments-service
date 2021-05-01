import { OrderStatus } from "./Order";
interface OrderFilter {
    status?: OrderStatus
    email?: string
    start?: Date
    end?: Date
}

export default OrderFilter