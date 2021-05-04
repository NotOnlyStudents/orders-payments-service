import { attribute } from '@aws/dynamodb-data-mapper-annotations';
import Product from 'src/models/Product';

class ProductWithDynamoAnnotations implements Product {
  @attribute()
  id: string;

  @attribute()
  name: string;

  @attribute()
  description: string;

  @attribute()
  images: string[];

  @attribute()
  quantity: number;

  @attribute()
  price: number;

  @attribute()
  available: boolean;

  @attribute()
  evidence: boolean;

  @attribute()
  category: string[];

  constructor(
    id: string = '',
    name: string = '',
    description: string = '',
    images: string[] = [],
    quantity: number = 0,
    price: number = 0,
    available: boolean = false,
    evidence: boolean = false,
    category: string[] = [],
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.images = images;
    this.quantity = quantity;
    this.price = price;
    this.available = available;
    this.evidence = evidence;
    this.category = category;
  }
}

const annotate = (
  p: Product,
): ProductWithDynamoAnnotations => (
  new ProductWithDynamoAnnotations(p.id,
    p.name,
    p.description,
    p.images,
    p.quantity,
    p.price,
    p.available,
    p.evidence,
    p.category)
);

export { ProductWithDynamoAnnotations, annotate };
