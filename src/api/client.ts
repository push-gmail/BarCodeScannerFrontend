import axios from "axios";

export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const publicRoutes = [
    "/auth/user/register",
    "/auth/user/login",
    "/auth/user/forgot-password",
    "/auth/user/reset-password",
    "/auth/affiliate/login",
    "/auth/admin/login",
    "/public/affiliate/referral",
  ];
  const isPublicRequest = publicRoutes.some((route) => config.url?.includes(route));
  if (token && !isPublicRequest) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
