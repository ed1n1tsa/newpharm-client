export type CartItem = {
  productId: string;
  qty: number;
  name: string;
  price: number;
  image_url?: string | null;
};

export const GUEST_CART_KEY = "np_guest_cart_v1";

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.qty, 0);
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.qty * (i.price || 0), 0);
}
