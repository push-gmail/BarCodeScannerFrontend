import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import HomePage from "../pages/public/HomePage";
import CategoryProducts from "../pages/public/CategoryProducts";
import ProductDetails from "../pages/public/ProductDetails";
import CartPage from "../pages/public/CartPage";

import AffiliateLogin from "../pages/affiliate/AffiliateLogin";
import AffiliateLayout from "../layouts/AffiliateLayout";
import AffiliateDashboard from "../pages/affiliate/AffiliateDashboard";
import AffiliateProducts from "../pages/affiliate/AffiliateProducts";
import AffiliateScans from "../pages/affiliate/AffiliateScans";
import AffiliateNotifications from "../pages/affiliate/AffiliateNotifications";

import AffiliateRegister from "../pages/affiliateMember/AffiliateRegister";
import AffiliateJoin from "../pages/affiliateMember/AffiliateJoin";
import AffiliateMemberLogin from "../pages/affiliateMember/AffiliateMemberLogin";
import AffiliateMemberLayout from "../layouts/AffiliateMemberLayout";
import AffiliateMemberDashboard from "../pages/affiliateMember/AffiliateMemberDashboard";
import AffiliateMemberProducts from "../pages/affiliateMember/AffiliateMemberProducts";
import AffiliateMemberProfile from "../pages/affiliateMember/AffiliateMemberProfile";
import AffiliateMemberKyc from "../pages/affiliateMember/AffiliateMemberKyc";

import AdminLogin from "../pages/admin/AdminLogin";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminOrders from "../pages/admin/AdminOrders";
import AdminScans from "../pages/admin/AdminScans";
import AdminAffiliateApplications from "../pages/admin/AdminAffiliateApplications";
import AdminAffiliateMembers from "../pages/admin/AdminAffiliateMembers";
import AdminAffiliateKyc from "../pages/admin/AdminAffiliateKyc";

import MasterLogin from "../pages/master/MasterLogin";
import MasterLayout from "../layouts/MasterLayout";
import MasterDashboard from "../pages/master/MasterDashboard";
import MasterCategories from "../pages/master/MasterCategories";
import MasterCategoryProducts from "../pages/master/MasterCategoriesProducts";

import { captureAffiliateReferral } from "../api/affiliateApi";

type GuardRole = "user" | "admin" | "master" | "affiliate";

function Guard({ role, children }: { role: GuardRole; children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  const current = localStorage.getItem("role");
  if (!token || current !== role) {
    if (role === "admin") return <Navigate to="/admin/login" replace />;
    if (role === "master") return <Navigate to="/master/login" replace />;
    if (role === "affiliate") return <Navigate to="/affiliate-member/login" replace />;
    return <Navigate to="/affiliate/login" replace />;
  }
  return <>{children}</>;
}

function ReferralCapture() {
  const location = useLocation();
  useEffect(() => {
    const ref = new URLSearchParams(location.search).get("ref");
    if (!ref) return;
    captureAffiliateReferral(ref).catch(() => {
      // Invalid/inactive referral simply does not create the attribution cookie.
    });
  }, [location.search]);
  return null;
}

export default function AppRoutes() {
  return (
    <>
      <ReferralCapture />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/category/:slug" element={<CategoryProducts />} />
        <Route path="/category/:slug/product/:productId/image/:imageIndex" element={<ProductDetails />} />
        <Route path="/cart" element={<CartPage />} />

        {/* Existing QR Recovery My Account - preserved */}
        <Route path="/affiliate/login" element={<AffiliateLogin />} />
        <Route path="/affiliate" element={<Guard role="user"><AffiliateLayout /></Guard>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AffiliateDashboard />} />
          <Route path="products" element={<AffiliateProducts />} />
          <Route path="scans" element={<AffiliateScans />} />
          <Route path="notifications" element={<AffiliateNotifications />} />
        </Route>
        <Route path="/user/*" element={<Navigate to="/affiliate/dashboard" replace />} />

        {/* New real Affiliate Member journey + CRM */}
        <Route path="/affiliate-member/register" element={<AffiliateRegister />} />
        <Route path="/affiliate-member/join" element={<AffiliateJoin />} />
        <Route path="/affiliate-member/login" element={<AffiliateMemberLogin />} />
        <Route path="/affiliate-member" element={<Guard role="affiliate"><AffiliateMemberLayout /></Guard>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AffiliateMemberDashboard />} />
          <Route path="products" element={<AffiliateMemberProducts />} />
          <Route path="settings/profile" element={<AffiliateMemberProfile />} />
          <Route path="settings/kyc" element={<AffiliateMemberKyc />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<Guard role="admin"><AdminLayout /></Guard>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="orders" element={<AdminOrders />} />
          {/* <Route path="scans" element={<AdminScans />} /> */}
          <Route path="affiliate-applications" element={<AdminAffiliateApplications />} />
          <Route path="affiliate-members" element={<AdminAffiliateMembers />} />
          <Route path="affiliate-kyc" element={<AdminAffiliateKyc />} />
        </Route>

        <Route path="/master/login" element={<MasterLogin />} />
        <Route path="/master" element={<Guard role="master"><MasterLayout /></Guard>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<MasterDashboard />} />
          <Route path="categories" element={<MasterCategories />} />
          <Route path="category-products" element={<MasterCategoryProducts />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
