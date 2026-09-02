import { api } from "./client";

export type AdminOrderStatus = "pending" | "approved";

export type AdminOrderUser = {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
};

export type AdminOrderImage = {
  filename?: string;
  path?: string;
  url?: string;
  qrData?: string;
};

export type AdminOrderSpecificationValue = {
  key: string;
  label: string;
  value: unknown;
};

export type AdminOrderItem = {
  categoryProductId?: string;
  categoryId?: string;
  categoryName?: string;
  categorySlug?: string;
  selectedImage?: AdminOrderImage;
  image?: AdminOrderImage;
  unitPrice?: number;
  price?: number;
  lineTotal?: number;
  quantity?: number;
  specificationValues?: AdminOrderSpecificationValue[];
  specifications?: AdminOrderSpecificationValue[];
};

export type ApprovalQrCode = {
  _id: string;
  code: string;
  token: string;
  orderItemIndex: number;
  qrImageUrl: string;
  qrValue: string;
  status: "active" | "disabled";
};

export type AdminOrder = {
  _id: string;
  userId?: AdminOrderUser;
  user?: AdminOrderUser;
  items: AdminOrderItem[];
  subtotal?: number;
  totalAmount: number;
  total?: number;
  status: AdminOrderStatus;
  paymentMethod?: string;
  paymentStatus?: string;
  rejectionReason?: string;
  processedBy?: { _id?: string; id?: string; email?: string } | null;
  processedAt?: string | null;
  approvalEmailSentAt?: string | null;
  approvalEmailError?: string;
  createdAt?: string;
  updatedAt?: string;
};

export const getAdminDashboard = () => api.get("/admin/dashboard");
export const getAdminUsers = () => api.get("/admin/users");
export const getAdminUserById = (userId: string) => api.get(`/admin/users/${userId}`);
export const updateAdminUserStatus = (userId: string, status: string) =>
  api.put(`/admin/users/${userId}/status`, { status });

export const getAdminOrders = (status?: AdminOrderStatus) =>
  api.get<{ success: boolean; count: number; orders: AdminOrder[] }>("/admin/orders", {
    params: status ? { status } : undefined,
  });

export const getAdminOrderById = (orderId: string) =>
  api.get<{ success: boolean; order: AdminOrder }>(`/admin/orders/${orderId}`);

export const updateAdminOrderStatus = (orderId: string, status: AdminOrderStatus) =>
  api.put<{
    success: boolean;
    message: string;
    order: AdminOrder;
    qrCodes?: ApprovalQrCode[];
    pdfUrl?: string;
    emailSent?: boolean;
    emailError?: string;
  }>(`/admin/orders/${orderId}/status`, { status });

export const approveAdminOrder = (orderId: string) => updateAdminOrderStatus(orderId, "approved");
export const markAdminOrderPending = (orderId: string) => updateAdminOrderStatus(orderId, "pending");
export const getAdminQrCodes = () => api.get("/admin/qr-codes");
export const getAdminScanEvents = () => api.get("/admin/scan-events");

/* Part 11-13: affiliate admin */
export const getAffiliateApplications = (status?: "pending" | "approved" | "rejected") =>
  api.get("/admin/affiliate-applications", { params: status ? { status } : undefined });

export const reviewAffiliateApplication = (
  id: string,
  status: "approved" | "rejected",
  reason?: string,
) => api.put(`/admin/affiliate-applications/${id}/status`, { status, reason });

export const getAffiliateMembers = () => api.get("/admin/affiliate-members");

export const getAffiliateKycAdmin = (status?: "pending" | "verified" | "rejected") =>
  api.get("/admin/affiliate-kyc", { params: status ? { status } : undefined });

export const reviewAffiliateKyc = (
  id: string,
  status: "verified" | "rejected",
  reason?: string,
) => api.put(`/admin/affiliate-kyc/${id}/status`, { status, reason });
