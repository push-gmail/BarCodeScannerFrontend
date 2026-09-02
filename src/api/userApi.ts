import { api } from "./client";

export type CartSpecificationValue = {
  key: string;
  label: string;
  value: string;
};

/* =========================================================
   CART
========================================================= */

export const addCategoryProductToCart = (payload: {
  categoryProductId: string;
  imageIndex: number;
  specificationValues: Record<string, string>;
  quantity?: number;
}) => api.post("/user/cart", payload);

export const getCart = () =>
  api.get("/user/cart");

export const updateCartItem = (
  cartItemId: string,
  quantity: number,
) =>
  api.put(
    `/user/cart/${cartItemId}`,
    {
      quantity,
    },
  );

export const removeCartItem = (
  cartItemId: string,
) =>
  api.delete(
    `/user/cart/${cartItemId}`,
  );

export const clearCart = () =>
  api.delete("/user/cart");

/* =========================================================
   ORDERS
========================================================= */

export const placeOrder = (
  paymentMethod: string,
) =>
  api.post(
    "/user/orders",
    {
      paymentMethod,
    },
  );



  
export const getOrders = () =>
  api.get("/user/orders");

export const getOrder = (
  orderId: string,
) =>
  api.get(
    `/user/orders/${orderId}`,
  );

/* =========================================================
   USER / AFFILIATE PRODUCTS
========================================================= */

export const getProducts = () =>
  api.get("/user/products");

export const getProduct = (
  productId: string,
) =>
  api.get(
    `/user/products/${productId}`,
  );

export const getProductScanHistory = (
  productId: string,
) =>
  api.get(
    `/user/products/${productId}/scan-history`,
  );

/* =========================================================
   PART 8 / PART 9 - WHO SCANNED IT
========================================================= */

export const getScanEvents = () =>
  api.get("/user/scan-events");

export const markScanEventSeen = (
  id: string,
) =>
  api.put(
    `/user/scan-events/${id}/seen`,
  );

/* =========================================================
   PART 9 - SHARE OWNER PHONE WITH FINDER

   Owner clicks "Share My Number"
   ↓
   Backend verifies scan belongs to logged user
   ↓
   User model se owner phone fetch
   ↓
   Socket.IO finder session ko phone send
========================================================= */

export const shareOwnerPhoneWithFinder = (
  scanEventId: string,
) =>
  api.put<{
    success: boolean;
    message: string;
    shared: boolean;
    sharedAt?: string | null;
  }>(
    `/user/scan-events/${scanEventId}/share-phone`,
  );

/* =========================================================
   NOTIFICATIONS
========================================================= */

export const getNotifications = () =>
  api.get("/user/notifications");

export const markNotificationRead = (
  id: string,
) =>
  api.put(
    `/user/notifications/${id}/read`,
  );

export const markAllNotificationsRead = () =>
  api.put(
    "/user/notifications/read-all",
  );

/* =========================================================
   PROFILE
========================================================= */

export const getProfile = () =>
  api.get("/user/profile");

export const updateProfile = (
  payload: unknown,
) =>
  api.put(
    "/user/profile",
    payload,
  );