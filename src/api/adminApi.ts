import { api } from "./client";
export const getAdminDashboard = () => api.get("/admin/dashboard");
export const getAdminUsers = () => api.get("/admin/users");
export const updateUserStatus = (id: string, status: string) => api.put(`/admin/users/${id}/status`, { status });
export const getAdminOrders = () => api.get("/admin/orders");
export const approveOrder = (id: string) => api.put(`/admin/orders/${id}/approve`);
export const rejectOrder = (id: string) => api.put(`/admin/orders/${id}/reject`, { reason: "Rejected by admin" });
export const getAdminScans = () => api.get("/admin/scan-events");
