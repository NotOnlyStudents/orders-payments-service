import Address from "src/models/Address"
import Product from "src/models/Product";

enum OrderStatus {
    new = "new",
    fulfilled = "fulfilled"
}

interface Order {
    id: string
    customerEmail: string
    address: Address
    products: Product[]
    date: string
    status: OrderStatus;
}

export { Order, OrderStatus }