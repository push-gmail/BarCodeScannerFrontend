import { useEffect, useState } from "react";
import { MapPin, Phone } from "lucide-react";
import { BACKEND_URL } from "../../api/client";
import { getScanEvents } from "../../api/userApi";

export default function AffiliateScans() {
  const [rows, setRows] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getScanEvents().then((r) => setRows(r.data)).catch((e) => setMessage(e?.response?.data?.message || "Could not load scan history"));
  }, []);

  return (
    <div>
      <span className="eyebrow">AFFILIATE PORTAL</span>
      <h1>Who Scanned QR Code</h1>
      <p>Finder photo, contact, location and scan time are shown here after a QR submission.</p>
      {message && <p>{message}</p>}
      <div className="scanGrid">
        {rows.map((event) => (
          <article className="scanCard" key={event._id}>
            {event.photoUrl ? <img src={`${BACKEND_URL}${event.photoUrl}`} alt="Finder submission" /> : <div className="photoPlaceholder">No photo</div>}
            <div>
              <h3>{event.homeItemId?.title || "Home item"}</h3>
              <p><b>Finder:</b> {event.finderName || "Not provided"}</p>
              <p><b>Phone:</b> {event.finderPhone || "Not provided"}</p>
              <p><b>Location:</b> {event.address || "Coordinates shared"}</p>
              <p><b>Scanned:</b> {new Date(event.createdAt).toLocaleString()}</p>
              <div className="cardActions">
                {event.finderPhone && <a className="secondaryAction" href={`tel:${event.finderPhone}`}><Phone size={17}/> Call</a>}
                {event.latitude != null && event.longitude != null && (
                  <a className="secondaryAction" href={`https://maps.google.com/?q=${event.latitude},${event.longitude}`} target="_blank" rel="noreferrer"><MapPin size={17}/> View Location</a>
                )}
              </div>
            </div>
          </article>
        ))}
        {rows.length === 0 && <div className="emptyState">No QR scan events yet.</div>}
      </div>
    </div>
  );
}
