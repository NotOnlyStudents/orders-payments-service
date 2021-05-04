interface Product {
  id: string;
  name: string;
  description: string;
  images: string[];
  quantity: number;
  price: number;
  available: boolean;
  evidence: boolean;
  category: string[];
}

export default Product;
