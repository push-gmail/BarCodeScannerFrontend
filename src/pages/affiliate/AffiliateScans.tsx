import { useEffect, useState } from "react";
import {
  CheckCircle2,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
} from "lucide-react";

import { BACKEND_URL } from "../../api/client";
import {
  getScanEvents,
  markScanEventSeen,
  shareOwnerPhoneWithFinder,
} from "../../api/userApi";

type ScanEventRow = {
  _id: string;
  categoryName?: string;
  categorySlug?: string;
  finderPhoto?: {
    url?: string;
    path?: string;
  };
  finderPhone?: string;
  finderPhoneShared?: boolean;
  comment?: string;
  location?: {
    latitude?: number | null;
    longitude?: number | null;
    accuracy?: number | null;
    manualLocation?: string;
    source?: "live" | "manual" | "none";
  };
  seenByOwner?: boolean;
  ownerPhoneShared?: boolean;
  ownerPhoneSharedAt?: string | null;
  createdAt: string;
};

function mediaUrl(row: ScanEventRow) {
  const value = row.finderPhoto?.url || row.finderPhoto?.path || "";
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `${BACKEND_URL}/${value.replace(/^\/+/, "")}`;
}

function mapUrl(row: ScanEventRow) {
  const latitude = row.location?.latitude;
  const longitude = row.location?.longitude;
  if (latitude == null || longitude == null) return "";
  return `https://maps.google.com/?q=${latitude},${longitude}`;
}

function whatsappUrl(phone: string) {
  let digits = String(phone || "").replace(/\D/g, "");

  /* Indian 10-digit local number convenience. */
  if (digits.length === 10) digits = `91${digits}`;

  return digits ? `https://wa.me/${digits}` : "";
}

function normalizeSocketRow(payload: any): ScanEventRow | null {
  const row = payload?.scanEvent;
  if (!row?._id) return null;
  return row as ScanEventRow;
}

export default function AffiliateScans() {
  const [rows, setRows] = useState<ScanEventRow[]>([]);
  const [message, setMessage] = useState("");
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [shareMessages, setShareMessages] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;

    getScanEvents()
      .then(async (response) => {
        if (!active) return;

        const data = Array.isArray(response.data) ? response.data : [];
        setRows(data);

        const unseenIds = data
          .filter((row: ScanEventRow) => !row.seenByOwner)
          .map((row: ScanEventRow) => row._id);

        if (unseenIds.length) {
          await Promise.allSettled(
            unseenIds.map((id: string) => markScanEventSeen(id)),
          );

          if (active) {
            setRows((current) =>
              current.map((row) => ({ ...row, seenByOwner: true })),
            );
            window.dispatchEvent(new Event("scans:seen"));
          }
        }
      })
      .catch((error) => {
        if (active) {
          setMessage(
            error?.response?.data?.message || "Could not load scan history",
          );
        }
      });

    const onScanNew = async (event: Event) => {
      const payload = (event as CustomEvent<any>).detail;
      const incoming = normalizeSocketRow(payload);
      if (!incoming) return;

      setRows((current) => {
        if (current.some((row) => row._id === incoming._id)) return current;
        return [{ ...incoming, seenByOwner: true }, ...current];
      });

      try {
        await markScanEventSeen(incoming._id);
        window.dispatchEvent(new Event("scans:seen"));
      } catch {
        // The list still shows the new scan even if the seen update fails.
      }
    };

    window.addEventListener("scan:new", onScanNew as EventListener);

    return () => {
      active = false;
      window.removeEventListener("scan:new", onScanNew as EventListener);
    };
  }, []);

  const shareMyNumber = async (eventId: string) => {
    if (sharingId) return;

    setSharingId(eventId);
    setShareMessages((current) => ({ ...current, [eventId]: "" }));

    try {
      const response = await shareOwnerPhoneWithFinder(eventId);

      setRows((current) =>
        current.map((row) =>
          row._id === eventId
            ? {
                ...row,
                ownerPhoneShared: true,
                ownerPhoneSharedAt:
                 response.data.sharedAt || new Date().toISOString() 
              }
            : row,
        ),
      );

      setShareMessages((current) => ({
        ...current,
        [eventId]: response.data.message || "Your number was shared.",
      }));
    } catch (error: any) {
      setShareMessages((current) => ({
        ...current,
        [eventId]:
          error?.response?.data?.message || "Could not share your number.",
      }));
    } finally {
      setSharingId(null);
    }
  };

  return (
    <div className="accountPage scansAccountPage">
      <div className="accountPageHead">
        <div>
          <span className="eyebrow">MY ACCOUNT</span>
          <h1>Who Scanned It</h1>
          <p>
            Finder photo, shared contact, location, message and scan time are
            saved here.
          </p>
        </div>
      </div>

      {message && <p className="formMessage">{message}</p>}

      <div className="scanGrid">
        {rows.map((event) => {
          const photo = mediaUrl(event);
          const map = mapUrl(event);
          const phone =
            event.finderPhoneShared && event.finderPhone
              ? event.finderPhone
              : "";
          const whatsapp = phone ? whatsappUrl(phone) : "";
          const locationText =
            event.location?.manualLocation ||
            (map ? "Live location shared" : "Not shared");

          return (
            <article className="scanCard recoveryScanCard" key={event._id}>
              {photo ? (
                <img src={photo} alt="Finder submission" />
              ) : (
                <div className="photoPlaceholder">No photo</div>
              )}

              <div className="scanCardContent">
                <div className="scanCardTopline">
                  <h3>{event.categoryName || "QR Item"}</h3>
                  <span className="scanTime">
                    {new Date(event.createdAt).toLocaleString()}
                  </span>
                </div>

                <p>
                  <b>Phone:</b> {phone || "Not shared"}
                </p>
                <p>
                  <b>Location:</b> {locationText}
                </p>
                <p>
                  <b>Message:</b> {event.comment || "No message provided"}
                </p>

                <div className="cardActions">
                  {phone && (
                    <a className="secondaryAction" href={`tel:${phone}`}>
                      <Phone size={17} /> Call
                    </a>
                  )}

                  {whatsapp && (
                    <a
                      className="secondaryAction"
                      href={whatsapp}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MessageCircle size={17} /> WhatsApp
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
                      sharingId === event._id || Boolean(event.ownerPhoneShared)
                    }
                    onClick={() => shareMyNumber(event._id)}
                  >
                    {event.ownerPhoneShared ? (
                      <>
                        <CheckCircle2 size={17} /> Number Shared
                      </>
                    ) : (
                      <>
                        <Share2 size={17} />
                        {sharingId === event._id
                          ? "Sharing..."
                          : "Share My Number"}
                      </>
                    )}
                  </button>
                </div>

                {shareMessages[event._id] && (
                  <p className="formMessage">{shareMessages[event._id]}</p>
                )}
              </div>
            </article>
          );
        })}

        {rows.length === 0 && (
          <div className="emptyState">No QR scan events yet.</div>
        )}
      </div>
    </div>
  );
}
