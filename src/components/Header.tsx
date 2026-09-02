import { Bell, Home, ShoppingCart, Tag, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { BACKEND_URL } from "../api/client";
import { getPublicCategories, type PublicCategory } from "../api/publicApi";
import { getCart, getNotifications } from "../api/userApi";
import { isUserSession } from "../store/auth";

type Props = { cartCount?: number; onLogin: () => void };

export default function Header({ cartCount = 0, onLogin }: Props) {
  const nav = useNavigate();
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [liveCount, setLiveCount] = useState(cartCount);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => setLiveCount(cartCount), [cartCount]);
  useEffect(() => {
    getPublicCategories().then(({ data }) => setCategories(data.categories || [])).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let socket: Socket | null = null;
    const connect = async () => {
      if (!isUserSession()) {
        setLiveCount(0);
        setNotificationCount(0);
        socket?.disconnect();
        socket = null;
        return;
      }
      try { const { data } = await getCart(); setLiveCount(data.count || 0); } catch {}
      try { const { data } = await getNotifications(); const rows = Array.isArray(data) ? data : []; setNotificationCount(rows.filter((row: any) => !row?.read).length); } catch {}
      const token = localStorage.getItem("token");
      if (!token) return;
      socket?.disconnect();
      socket = io(BACKEND_URL, { auth: { token }, transports: ["websocket", "polling"] });
      socket.on("cart:updated", (payload: { count?: number }) => {
        if (typeof payload?.count === "number") setLiveCount(payload.count);
      });
      socket.on("scan:new", () => setNotificationCount((count) => count + 1));
    };

    const onCartChanged = (event: Event) => {
      const detail = (event as CustomEvent<{ count?: number }>).detail;
      if (typeof detail?.count === "number") setLiveCount(detail.count);
    };
    const onNotificationsRead = () => setNotificationCount(0);
    connect();
    window.addEventListener("auth:changed", connect);
    window.addEventListener("cart:changed", onCartChanged as EventListener);
    window.addEventListener("notifications:read", onNotificationsRead);
    return () => {
      window.removeEventListener("auth:changed", connect);
      window.removeEventListener("cart:changed", onCartChanged as EventListener);
      window.removeEventListener("notifications:read", onNotificationsRead);
      socket?.disconnect();
    };
  }, []);

  const openAffiliate = () => {
    // Part 11: Public Affiliate button starts the real affiliate-member journey.
    nav(isUserSession() ? "/affiliate-member/join" : "/affiliate-member/register");
  };

  const openNotifications = () => {
    if (!isUserSession()) return onLogin();
    nav("/affiliate/notifications");
  };

  return <>
    <header className="top">
      <Link className="brand" to="/"><span className="logo">H</span><span>HomeQR</span></Link>
      <div className="search">Search QR products</div>
      <div className="headActions">
        <button type="button" onClick={() => isUserSession() ? nav("/affiliate/dashboard") : onLogin()}><UserRound size={18} />{isUserSession() ? "Account" : "Login"}</button>
        <button type="button" onClick={openAffiliate}>Affiliate</button>
        <button type="button" className="notificationBellBtn" onClick={openNotifications} aria-label="Notifications"><Bell size={20} />{notificationCount > 0 && <span className="notificationBellBadge">{notificationCount > 99 ? "99+" : notificationCount}</span>}</button>
        <button type="button" className="cartBtn" onClick={() => nav("/cart")}><ShoppingCart size={20} /><span>{liveCount}</span></button>
      </div>
    </header>
    <nav className="categoryBar">
      {categories.map((category) => <button type="button" key={category._id} onClick={() => nav(`/category/${category.slug}`)}>{category.slug === "home" ? <Home size={17} /> : <Tag size={17} />}{category.name}</button>)}
    </nav>
  </>;
}
