import { attribute, autoGeneratedHashKey, table } from '@aws/dynamodb-data-mapper-annotations';
import { embed } from '@aws/dynamodb-data-mapper';
import Address from 'src/models/Address';
import { AddressWithDynamoAnnotations, annotate as annotateAddress } from 'src/repository/AddressDynamoDB';
import { Order, OrderStatus } from 'src/models/Order';
import Product from 'src/models/Product';
import { ProductWithDynamoAnnotations, annotate as annotateProduct } from './ProductDynamoDB';

@table(process.env.PAYED_ORDERS_TABLE_NAME)
class PayedOrderWithDynamoAnnotations {
  @autoGeneratedHashKey()
  id: string;

  @attribute({
    indexKeyConfigurations: {
      userIdIndex: 'HASH',
    },
  })
  customerId: string;

  @attribute()
  customerEmail: string;

  @attribute()
  address: AddressWithDynamoAnnotations;

  @attribute({ memberType: embed(ProductWithDynamoAnnotations) })
  products: ProductWithDynamoAnnotations[];

  @attribute({ defaultProvider: () => Date.now() })
  numberDate: number;

  @attribute({ defaultProvider: () => OrderStatus.new })
  status: OrderStatus;

  @attribute()
  additionalInfo: string;

  constructor(
    id: string = '',
    customerId = '',
    customerEmail: string = '',
    address: Address = new AddressWithDynamoAnnotations(),
    products: Product[] = [],
    additionalInfo: string = '',
  ) {
    if (id !== '') this.id = id;
    this.customerId = customerId;
    this.customerEmail = customerEmail;
    this.address = address;
    this.products = products;
    this.additionalInfo = additionalInfo;
  }
}
const annotate = (order: Order, customerId: string): PayedOrderWithDynamoAnnotations => {
  const annotatedProducts: ProductWithDynamoAnnotations[] = order.products.map(annotateProduct);
  return new PayedOrderWithDynamoAnnotations(
    order.id,
    customerId,
    order.customerEmail,
    annotateAddress(order.address),
    annotatedProducts,
    order.additionalInfo,
  );
};

const deannotate = (annotatedOrder: PayedOrderWithDynamoAnnotations): Order => {
  const deannotated = { ...annotatedOrder, date: new Date(annotatedOrder.numberDate) };
  delete deannotated.customerId;
  delete deannotated.numberDate;
  return deannotated as Order;
};
export { PayedOrderWithDynamoAnnotations, annotate, deannotate };
