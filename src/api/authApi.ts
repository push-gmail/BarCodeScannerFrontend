import { api } from "./client";

export const registerUser = (
  payload: Record<string, string>
) =>
  api.post(
    "/auth/user/register",
    payload
  );

export const loginUser = (
  email: string,
  password: string
) =>
  api.post(
    "/auth/user/login",
    {
      email,
      password,
    }
  );

export const loginAffiliate = (
  email: string,
  password: string
) =>
  api.post(
    "/auth/affiliate/login",
    {
      email,
      password,
    }
  );

export const loginAdmin = (
  email: string,
  password: string
) =>
  api.post(
    "/auth/admin/login",
    {
      email,
      password,
    }
  );

/* =========================================
   Forgot Password
========================================= */

export const forgotPassword = (
  email: string
) =>
  api.post(
    "/auth/user/forgot-password",
    {
      email,
    }
  );

/* =========================================
   Reset Password
========================================= */

export const resetPassword = (
  token: string,
  password: string,
  confirmPassword: string
) =>
  api.post(
    `/auth/user/reset-password/${token}`,
    {
      password,
      confirmPassword,
    }
  );