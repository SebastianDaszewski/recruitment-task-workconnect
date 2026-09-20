export type Product = {
  name: string;
  sku: string;
  category: string;
  price: string;
  available: boolean;
  stock: number | null;
};

export type NewProduct = Product;