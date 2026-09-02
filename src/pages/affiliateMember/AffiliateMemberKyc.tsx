import { useEffect, useState } from "react";
import { getAffiliateKyc, getAffiliateMe, submitAffiliateKyc } from "../../api/affiliateApi";

export default function AffiliateMemberKyc() {
  const [status, setStatus] = useState("not_submitted");
  const [reason, setReason] = useState("");
  const [pan, setPan] = useState<File | null>(null);
  const [aadhaar, setAadhaar] = useState<File | null>(null);
  const [others, setOthers] = useState<FileList | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const [k, m] = await Promise.all([getAffiliateKyc(), getAffiliateMe()]);
    setStatus(k.data?.status || m.data.kycStatus || "not_submitted");
    setReason(k.data?.rejectionReason || "");
  };
  useEffect(() => { load().catch(() => {}); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setMessage("");
    try {
      const form = new FormData();
      if (pan) form.append("panDocument", pan);
      if (aadhaar) form.append("aadhaarDocument", aadhaar);
      if (others) Array.from(others).forEach((file) => form.append("otherDocuments", file));
      const { data } = await submitAffiliateKyc(form);
      setMessage(data.message || "KYC submitted");
      await load();
    } catch (error: any) { setMessage(error?.response?.data?.message || "KYC upload failed"); }
    finally { setLoading(false); }
  };

  return <div className="amPanel narrow"><span className="amEyebrow">SETTINGS / KYC</span><h1>KYC Verification</h1><div className={`amKycStatus ${status}`}><b>Status:</b> {status.replace("_", " ")}</div>
    {reason && <p className="amMessage error">Reason: {reason}</p>}
    <p>PAN and Aadhaar are required. JPG, PNG or PDF up to 8 MB each. Documents are stored privately and are only accessible to authenticated admin review.</p>
    <form className="amForm" onSubmit={submit}>
      <label>PAN Card<input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => setPan(e.target.files?.[0] || null)} required={status === "not_submitted"} /></label>
      <label>Aadhaar Card<input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => setAadhaar(e.target.files?.[0] || null)} required={status === "not_submitted"} /></label>
      <label>Other Documents (optional)<input type="file" multiple accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => setOthers(e.target.files)} /></label>
      <button className="amPrimary" disabled={loading}>{loading ? "Uploading..." : status === "rejected" ? "Resubmit KYC" : "Submit KYC"}</button>
    </form>{message && <p className="amMessage">{message}</p>}</div>;
}
