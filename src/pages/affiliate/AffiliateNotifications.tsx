import { useEffect, useState } from "react";
import { BACKEND_URL } from "../../api/client";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "../../api/userApi";

export default function AffiliateNotifications() {
  const [rows, setRows] = useState<any[]>([]);

  const load = () => getNotifications().then((r) => setRows(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const readOne = async (id: string) => { await markNotificationRead(id); await load(); };
  const readAll = async () => { await markAllNotificationsRead(); await load(); };

  return (
    <div>
      <div className="pageHead">
        <div><span className="eyebrow">AFFILIATE PORTAL</span><h1>Notifications</h1></div>
        <button className="secondaryAction" onClick={readAll}>Mark all as read</button>
      </div>
      {rows.map((n) => (
        <div className={`alertCard ${n.read ? "isRead" : ""}`} key={n._id}>
          <h3>{n.title}</h3>
          <p>{n.message}</p>
          <small>{new Date(n.createdAt).toLocaleString()}</small>
          {n.scanEventId && (
            <>
              <p>Finder: {n.scanEventId.finderName || "Unknown"} · {n.scanEventId.finderPhone || "No phone"}</p>
              {n.scanEventId.photoUrl && <img src={`${BACKEND_URL}${n.scanEventId.photoUrl}`} alt="Finder" />}
              <div className="cardActions">
                {n.scanEventId.latitude != null && n.scanEventId.longitude != null && <a className="secondaryAction" href={`https://maps.google.com/?q=${n.scanEventId.latitude},${n.scanEventId.longitude}`} target="_blank" rel="noreferrer">View Location</a>}
                {n.scanEventId.finderPhone && <a className="secondaryAction" href={`tel:${n.scanEventId.finderPhone}`}>Call</a>}
                {!n.read && <button className="secondaryAction" onClick={() => readOne(n._id)}>Mark read</button>}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
