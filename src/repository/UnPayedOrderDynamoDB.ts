import { attribute, hashKey } from "@aws/dynamodb-data-mapper-annotations"
import Address from "src/models/Address"
import AddressWithDynamoAnnotations from "src/repository/AddressDynamoDB"
import { Order, OrderStatus } from "src/models/Order"
import Product from "src/models/Product"

class UnPayedOrderWithDynamoAnnotations implements Order {
  @hashKey()
  paymentId: string
  id: string
  @attribute()
  costumerEmail: string
  @attribute()
  address: Address
  @attribute()
  products: Product[]
  @attribute()
  date: string
  @attribute()
  status: OrderStatus

  constructor(
    paymentId: string = "",
    costumerEmail: string = "",
    address: Address = new AddressWithDynamoAnnotations(),
    products: Product[] = [],
    date: string = "",
    status: OrderStatus = OrderStatus.new
  ) {
    this.paymentId = paymentId
    this.id = ''
    this.costumerEmail = costumerEmail
    this.address = address
    this.products = products
    this.date = date
    this.status = status
  }

}


export default UnPayedOrderWithDynamoAnnotations