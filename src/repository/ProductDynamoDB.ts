import { attribute } from "@aws/dynamodb-data-mapper-annotations"
import Product from "src/models/Product"

class ProductWithDynamoAnnotations implements Product {
  @attribute()
  id: string
  @attribute()
  name: string
  @attribute()
  description: string
  @attribute()
  images: string[]
  @attribute()
  quantity: number
  @attribute()
  price: number
  @attribute()
  available: boolean
  @attribute()
  evidence: boolean
  @attribute()
  category: string[]

  constructor(
    id: string = "",
    name: string = "",
    description: string = "",
    images: string[] = [],
    quantity: number = 0,
    price: number = 0,
    available: boolean = false,
    evidence: boolean = false,
    category: string[] = []
  ) {
    this.id = id
    this.name = name
    this.description = description
    this.images = images
    this.quantity = quantity
    this.price = price
    this.available = available
    this.evidence = evidence
    this.category = category
  }
}

const annotate = (product: Product): ProductWithDynamoAnnotations => {
  return new ProductWithDynamoAnnotations(product.id, product.name, product.description, product.images, product.quantity, product.price, product.available, product.evidence, product.category)
}

export { ProductWithDynamoAnnotations, annotate }