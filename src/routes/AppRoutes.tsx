import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "../pages/public/HomePage";
import CartPage from "../pages/public/CartPage";
import AffiliateLogin from "../pages/affiliate/AffiliateLogin";
import AffiliateLayout from "../layouts/AffiliateLayout";
import AffiliateDashboard from "../pages/affiliate/AffiliateDashboard";
import AffiliateProducts from "../pages/affiliate/AffiliateProducts";
import AffiliateScans from "../pages/affiliate/AffiliateScans";
import AffiliateNotifications from "../pages/affiliate/AffiliateNotifications";
import AdminLogin from "../pages/admin/AdminLogin";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminOrders from "../pages/admin/AdminOrders";
import AdminScans from "../pages/admin/AdminScans";

function Guard({ role, children }: { role: "user" | "admin"; children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  const current = localStorage.getItem("role");
  if (!token || current !== role) return <Navigate to={role === "admin" ? "/admin/login" : "/affiliate/login"} replace />;
  return <>{children}</>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/cart" element={<CartPage />} />

      <Route path="/affiliate/login" element={<AffiliateLogin />} />
      <Route path="/affiliate" element={<Guard role="user"><AffiliateLayout /></Guard>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AffiliateDashboard />} />
        <Route path="products" element={<AffiliateProducts />} />
        <Route path="scans" element={<AffiliateScans />} />
        <Route path="notifications" element={<AffiliateNotifications />} />
      </Route>

      {/* Backward compatibility for the earlier /user portal links. */}
      <Route path="/user/*" element={<Navigate to="/affiliate/dashboard" replace />} />

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<Guard role="admin"><AdminLayout /></Guard>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="scans" element={<AdminScans />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
