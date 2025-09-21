export interface Dimensions {
  height: number;
  width: number;
  length: number;
}

export interface Product {
  product_id: string;
  dimensions: Dimensions;
}

export interface Order {
  order_id: number;
  products: Product[];
}

export interface Box {
  id: string;
  dimensions: Dimensions;
}

export interface PackedProduct {
  product_id: string;
  box_id: string | null;
  observation?: string;
}

export interface PackedBox {
  box_id: string | null;
  products: string[];
  observation?: string;
}

export interface PackedOrder {
  order_id: number;
  boxes: PackedBox[];
}
