import { api } from "./client";

export type AffiliateApplication = {
  _id: string;
  status: "pending" | "approved" | "rejected";
  appliedAt: string;
  rejectionReason?: string;
};

export type AffiliateMe = {
  affiliateId: string;
  status: "approved" | "inactive" | "rejected";
  kycStatus: "not_submitted" | "pending" | "verified" | "rejected";
  approvedAt?: string;
  joinedAt?: string | null;
  lastLoginAt?: string | null;
  user: {
    _id?: string;
    id?: string;
    name: string;
    email: string;
    phone?: string;
    country?: string;
    pincode?: string;
  };
};

export const registerForAffiliateJourney = (payload: {
  name: string;
  country: string;
  pincode: string;
  email: string;
  phone?: string;
  password: string;
}) => api.post("/auth/user/register", payload);

export const loginUserForAffiliateJourney = (email: string, password: string) =>
  api.post("/auth/user/login", { email, password });

export const joinAffiliate = () => api.post("/affiliate-member/join");
export const getAffiliateApplicationStatus = () =>
  api.get("/affiliate-member/application-status");

export const loginAffiliateMember = (affiliateId: string, password: string) =>
  api.post("/auth/affiliate/login", { affiliateId, password });

export const getAffiliateMe = () => api.get<AffiliateMe>("/affiliate-member/me");
export const updateAffiliateProfile = (payload: {
  name?: string;
  phone?: string;
  country?: string;
  pincode?: string;
}) => api.put("/affiliate-member/profile", payload);

export const getAffiliateProducts = () => api.get("/affiliate-member/products");
export const getAffiliateKyc = () => api.get("/affiliate-member/kyc");
export const submitAffiliateKyc = (formData: FormData) =>
  api.post("/affiliate-member/kyc", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const captureAffiliateReferral = (affiliateId: string) =>
  api.post("/public/affiliate/referral", { affiliateId });
