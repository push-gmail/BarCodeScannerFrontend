import { api } from "./client";

export const createHomeItem = (payload: unknown) => api.post("/user/home-items", payload);
export const getHomeItems = () => api.get("/user/home-items");
export const updateHomeItem = (id: string, payload: unknown) => api.put(`/user/home-items/${id}`, payload);
export const deleteHomeItem = (id: string) => api.delete(`/user/home-items/${id}`);

export const addToCart = (homeItemId: string) => api.post("/user/cart", { homeItemId, quantity: 1 });
export const getCart = () => api.get("/user/cart");
export const updateCartItem = (cartItemId: string, quantity: number) => api.put(`/user/cart/${cartItemId}`, { quantity });
export const removeCartItem = (cartItemId: string) => api.delete(`/user/cart/${cartItemId}`);
export const clearCart = () => api.delete("/user/cart");

export const placeOrder = (paymentMethod: string) => api.post("/user/orders", { paymentMethod });
export const getOrders = () => api.get("/user/orders");
export const getOrder = (orderId: string) => api.get(`/user/orders/${orderId}`);

export const getProducts = () => api.get("/user/products");
export const getProduct = (productId: string) => api.get(`/user/products/${productId}`);
export const getProductScanHistory = (productId: string) => api.get(`/user/products/${productId}/scan-history`);
export const getScanEvents = () => api.get("/user/scan-events");

export const getNotifications = () => api.get("/user/notifications");
export const markNotificationRead = (id: string) => api.put(`/user/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.put("/user/notifications/read-all");

export const getProfile = () => api.get("/user/profile");
export const updateProfile = (payload: unknown) => api.put("/user/profile", payload);
