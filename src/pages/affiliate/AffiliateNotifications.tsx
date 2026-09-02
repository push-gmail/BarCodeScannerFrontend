import { useEffect, useState } from "react";
import {
  CheckCircle2,
  MapPin,
  Phone,
  Share2,
} from "lucide-react";

import { BACKEND_URL } from "../../api/client";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  shareOwnerPhoneWithFinder
} from "../../api/userApi";

type NotificationRow = {
  _id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  scanEventId?: any;
};

function mediaUrl(scan: any) {
  const value = scan?.finderPhoto?.url || scan?.finderPhoto?.path || "";
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `${BACKEND_URL}/${String(value).replace(/^\/+/, "")}`;
}

function mapUrl(scan: any) {
  const latitude = scan?.location?.latitude;
  const longitude = scan?.location?.longitude;
  if (latitude == null || longitude == null) return "";
  return `https://maps.google.com/?q=${latitude},${longitude}`;
}

export default function AffiliateNotifications() {
  const [rows, setRows] = useState<NotificationRow[]>([]);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [shareMessages, setShareMessages] = useState<Record<string, string>>({});

  const load = () =>
    getNotifications()
      .then((response) => {
        setRows(Array.isArray(response.data) ? response.data : []);
      })
      .catch(() => {});

  useEffect(() => {
    load();

    const onScanNew = (event: Event) => {
      const payload = (event as CustomEvent<any>).detail;
      const incoming = payload?.notification;
      if (!incoming?._id) return;

      setRows((current) => {
        if (current.some((row) => row._id === incoming._id)) return current;
        return [incoming, ...current];
      });
    };

    window.addEventListener("scan:new", onScanNew as EventListener);

    return () => {
      window.removeEventListener("scan:new", onScanNew as EventListener);
    };
  }, []);

  const readOne = async (id: string) => {
    await markNotificationRead(id);

    setRows((current) =>
      current.map((row) => (row._id === id ? { ...row, read: true } : row)),
    );

    if (rows.filter((row) => !row.read && row._id !== id).length === 0) {
      window.dispatchEvent(new Event("notifications:read"));
    }
  };

  const readAll = async () => {
    await markAllNotificationsRead();
    setRows((current) => current.map((row) => ({ ...row, read: true })));
    window.dispatchEvent(new Event("notifications:read"));
  };

  const shareMyNumber = async (scanEventId: string) => {
    if (sharingId) return;

    setSharingId(scanEventId);
    setShareMessages((current) => ({ ...current, [scanEventId]: "" }));

    try {
      const response = await shareOwnerPhoneWithFinder(scanEventId);

      setRows((current) =>
        current.map((notification) => {
          const scan = notification.scanEventId;
          if (!scan || scan._id !== scanEventId) return notification;

          return {
            ...notification,
            scanEventId: {
              ...scan,
              ownerPhoneShared: true,
              ownerPhoneSharedAt:
                response.data.ownerPhoneSharedAt || new Date().toISOString(),
            },
          };
        }),
      );

      setShareMessages((current) => ({
        ...current,
        [scanEventId]: response.data.message || "Your number was shared.",
      }));
    } catch (error: any) {
      setShareMessages((current) => ({
        ...current,
        [scanEventId]:
          error?.response?.data?.message || "Could not share your number.",
      }));
    } finally {
      setSharingId(null);
    }
  };

  return (
    <div className="accountPage notificationsAccountPage">
      <div className="pageHead accountPageHead">
        <div>
          <span className="eyebrow">MY ACCOUNT</span>
          <h1>Notifications</h1>
          <p>QR scan alerts remain here even after the instant popup closes.</p>
        </div>

        <button className="secondaryAction" onClick={readAll}>
          Mark all as read
        </button>
      </div>

      <div className="notificationList">
        {rows.map((notification) => {
          const scan = notification.scanEventId;
          const photo = mediaUrl(scan);
          const map = mapUrl(scan);
          const phone =
            scan?.finderPhoneShared && scan?.finderPhone
              ? scan.finderPhone
              : "";
          const locationText =
            scan?.location?.manualLocation ||
            (map ? "Live location shared" : "Not shared");

          return (
            <article
              className={`alertCard accountAlertCard ${
                notification.read ? "isRead" : ""
              }`}
              key={notification._id}
            >
              <div className="notificationContent">
                <div className="notificationHeading">
                  <div>
                    <h3>{notification.title}</h3>
                    <p>{notification.message}</p>
                  </div>
                  {!notification.read && <span className="unreadDot" />}
                </div>

                <small>{new Date(notification.createdAt).toLocaleString()}</small>

                {scan && (
                  <div className="notificationScanDetails">
                    {photo && <img src={photo} alt="Finder submission" />}

                    <div>
                      <p>
                        <b>Category:</b> {scan.categoryName || "QR Item"}
                      </p>
                      <p>
                        <b>Phone:</b> {phone || "Not shared"}
                      </p>
                      <p>
                        <b>Location:</b> {locationText}
                      </p>

                      {scan.comment && (
                        <p>
                          <b>Message:</b> {scan.comment}
                        </p>
                      )}

                      <div className="cardActions">
                        {phone && (
                          <a className="secondaryAction" href={`tel:${phone}`}>
                            <Phone size={17} /> Call
                          </a>
                        )}

                        {map && (
                          <a
                            className="secondaryAction"
                            href={map}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <MapPin size={17} /> View Location
                          </a>
                        )}

                        <button
                          type="button"
                          className="secondaryAction"
                          disabled={
                            sharingId === scan._id ||
                            Boolean(scan.ownerPhoneShared)
                          }
                          onClick={() => shareMyNumber(scan._id)}
                        >
                          {scan.ownerPhoneShared ? (
                            <>
                              <CheckCircle2 size={17} /> Number Shared
                            </>
                          ) : (
                            <>
                              <Share2 size={17} />
                              {sharingId === scan._id
                                ? "Sharing..."
                                : "Share My Number"}
                            </>
                          )}
                        </button>

                        {!notification.read && (
                          <button
                            className="secondaryAction"
                            onClick={() => readOne(notification._id)}
                          >
                            Mark read
                          </button>
                        )}
                      </div>

                      {shareMessages[scan._id] && (
                        <p className="formMessage">
                          {shareMessages[scan._id]}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </article>
          );
        })}

        {rows.length === 0 && (
          <div className="emptyState">No notifications yet.</div>
        )}
      </div>
    </div>
  );
}
