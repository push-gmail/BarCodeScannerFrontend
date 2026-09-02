import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  Boxes,
  LayoutDashboard,
  LogOut,
  MapPin,
  Phone,
  ScanLine,
  X,
} from "lucide-react";
import { createPortal } from "react-dom";
import { io } from "socket.io-client";
import { BACKEND_URL } from "../api/client";
import { getNotifications, getScanEvents } from "../api/userApi";
import { logout } from "../store/auth";

type ScanLocation = {
  latitude?: number | null;
  longitude?: number | null;
  accuracy?: number | null;
  manualLocation?: string;
  source?: "live" | "manual" | "none";
};

type LiveScanEvent = {
  _id?: string;
  categoryName?: string;
  finderPhoto?: {
    url?: string;
    path?: string;
  };
  finderPhone?: string;
  finderPhoneShared?: boolean;
  comment?: string;
  location?: ScanLocation;
  createdAt?: string;
};

type ScanSocketPayload = {
  categoryName?: string;
  message?: string;
  scanEvent?: LiveScanEvent;
  notification?: any;
};

function mapUrl(location?: ScanLocation) {
  if (location?.latitude == null || location?.longitude == null) return "";
  return `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
}

export default function AffiliateLayout() {
  const nav = useNavigate();
  const [live, setLive] = useState<ScanSocketPayload | null>(null);
  const [unseenScanCount, setUnseenScanCount] = useState(0);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    Promise.allSettled([getScanEvents(), getNotifications()]).then((results) => {
      const scanResult = results[0];
      const notificationResult = results[1];

      if (scanResult.status === "fulfilled") {
        const rows = Array.isArray(scanResult.value.data)
          ? scanResult.value.data
          : [];
        setUnseenScanCount(rows.filter((row: any) => !row?.seenByOwner).length);
      }

      if (notificationResult.status === "fulfilled") {
        const rows = Array.isArray(notificationResult.value.data)
          ? notificationResult.value.data
          : [];
        setUnreadNotificationCount(rows.filter((row: any) => !row?.read).length);
      }
    });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io(BACKEND_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("scan:new", (payload: ScanSocketPayload) => {
      setLive(payload);
      setUnseenScanCount((count) => count + 1);
      setUnreadNotificationCount((count) => count + 1);

      window.dispatchEvent(
        new CustomEvent("scan:new", {
          detail: payload,
        }),
      );

      if (closeTimer.current) {
        window.clearTimeout(closeTimer.current);
      }

      closeTimer.current = window.setTimeout(() => {
        setLive(null);
      }, 8000);
    });

    return () => {
      if (closeTimer.current) {
        window.clearTimeout(closeTimer.current);
      }
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const onNotificationsRead = () => setUnreadNotificationCount(0);
    const onScansSeen = () => setUnseenScanCount(0);

    window.addEventListener("notifications:read", onNotificationsRead);
    window.addEventListener("scans:seen", onScansSeen);

    return () => {
      window.removeEventListener("notifications:read", onNotificationsRead);
      window.removeEventListener("scans:seen", onScansSeen);
    };
  }, []);

  const scan = live?.scanEvent;
  const location = scan?.location;
  const locationText =
    location?.manualLocation ||
    (location?.latitude != null && location?.longitude != null
      ? "Live location shared"
      : "Location not shared");

  const closePopup = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setLive(null);
  };

  const viewDetails = () => {
    closePopup();
    setUnseenScanCount(0);
    nav("/affiliate/scans");
  };

  return (
    <div className="dash accountDash">
      <aside className="sidebar accountSidebar">
        <div className="brand">
          <span className="logo">H</span>
          <span>My Account</span>
        </div>

        <NavLink to="/affiliate/dashboard">
          <LayoutDashboard /> Dashboard
        </NavLink>

        <NavLink to="/affiliate/products">
          <Boxes /> My QR Products
        </NavLink>

        <NavLink
          to="/affiliate/scans"
          onClick={() => setUnseenScanCount(0)}
        >
          <ScanLine />
          <span>Who Scanned It</span>
          {unseenScanCount > 0 && (
            <span className="sideCountBadge">
              {unseenScanCount > 99 ? "99+" : unseenScanCount}
            </span>
          )}
        </NavLink>

        <NavLink to="/affiliate/notifications">
          <Bell />
          <span>Notifications</span>
          {unreadNotificationCount > 0 && (
            <span className="sideCountBadge">
              {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
            </span>
          )}
        </NavLink>

        <button onClick={() => logout("/affiliate/login")}>
          <LogOut /> Logout
        </button>
      </aside>

      <section className="dashBody accountBody">
        <Outlet />
      </section>

      {live && typeof document !== "undefined"
        ? createPortal(
            <div className="scanPortalBackdrop" role="presentation">
              <section
                className="scanPortalCard"
                role="dialog"
                aria-modal="true"
                aria-label="QR scan notification"
              >
                <button
                  type="button"
                  className="scanPortalClose"
                  onClick={closePopup}
                  aria-label="Close"
                >
                  <X size={20} />
                </button>

                <div className="scanPortalIcon">
                  <ScanLine size={28} />
                </div>

                <span className="eyebrow">INSTANT RECOVERY ALERT</span>
                <h2>Your QR Was Scanned</h2>
                <p className="scanPortalMessage">
                  {live.message ||
                    "A finder submitted details for one of your QR codes."}
                </p>

                <div className="scanPortalDetails">
                  <div>
                    <span>Category</span>
                    <strong>
                      {scan?.categoryName || live.categoryName || "QR Item"}
                    </strong>
                  </div>

                  <div>
                    <span>Location</span>
                    <strong>{locationText}</strong>
                  </div>

                  <div>
                    <span>Phone</span>
                    <strong>
                      {scan?.finderPhoneShared && scan?.finderPhone
                        ? scan.finderPhone
                        : "Not shared"}
                    </strong>
                  </div>
                </div>

                {scan?.comment && (
                  <div className="scanPortalComment">“{scan.comment}”</div>
                )}

                <div className="scanPortalActions">
                  <button type="button" className="primary" onClick={viewDetails}>
                    View Details
                  </button>

                  {scan?.finderPhoneShared && scan?.finderPhone && (
                    <a className="secondaryAction" href={`tel:${scan.finderPhone}`}>
                      <Phone size={17} /> Call
                    </a>
                  )}

                  {mapUrl(location) && (
                    <a
                      className="secondaryAction"
                      href={mapUrl(location)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MapPin size={17} /> Map
                    </a>
                  )}
                </div>

                <small className="scanPortalTimer">
                  This alert closes automatically after 8 seconds.
                </small>
              </section>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
