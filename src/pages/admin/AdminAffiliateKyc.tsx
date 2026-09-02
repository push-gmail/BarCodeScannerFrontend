import { useEffect, useState } from "react";
import { API_URL } from "../../api/client";
import { getAffiliateKycAdmin, reviewAffiliateKyc } from "../../api/adminApi";

export default function AdminAffiliateKyc() {
  const [rows, setRows] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState("");
  const load = () => getAffiliateKycAdmin().then((r) => setRows(Array.isArray(r.data) ? r.data : []));
  useEffect(() => { load().catch(() => setMessage("Could not load KYC records")); }, []);

  const review = async (id: string, status: "verified" | "rejected") => {
    let reason = "";
    if (status === "rejected") reason = window.prompt("KYC rejection reason") || "KYC rejected";
    setBusy(id); setMessage("");
    try { const { data } = await reviewAffiliateKyc(id, status, reason); setMessage(data.message || `KYC ${status}`); await load(); }
    catch (error: any) { setMessage(error?.response?.data?.message || "Could not review KYC"); }
    finally { setBusy(""); }
  };

  const documentUrl = (id: string, type: "pan" | "aadhaar" | "other", index?: number) =>
    `${API_URL}/admin/affiliate-kyc/${id}/document/${type}${index == null ? "" : `/${index}`}`;

  return <div><h1>Affiliate KYC</h1><p>KYC documents are served only through authenticated admin routes.</p>{message && <p className="formMessage">{message}</p>}<div className="tableWrap"><table><thead><tr><th>Affiliate</th><th>Affiliate ID</th><th>Submitted</th><th>PAN</th><th>Aadhaar</th><th>Other</th><th>Status</th><th>Actions</th></tr></thead><tbody>{rows.map((row) => <tr key={row._id}><td>{row.userId?.name}<br /><small>{row.userId?.email}</small></td><td>{row.affiliateProfileId?.affiliateId}</td><td>{row.submittedAt ? new Date(row.submittedAt).toLocaleString() : "-"}</td><td>{row.panDocument ? <a href={documentUrl(row._id, "pan")} target="_blank" rel="noreferrer">View</a> : "-"}</td><td>{row.aadhaarDocument ? <a href={documentUrl(row._id, "aadhaar")} target="_blank" rel="noreferrer">View</a> : "-"}</td><td>{(row.otherDocuments || []).map((_d: any, i: number) => <a key={i} href={documentUrl(row._id, "other", i)} target="_blank" rel="noreferrer">Doc {i + 1} </a>)}</td><td>{row.status}</td><td>{row.status === "pending" ? <div className="cardActions"><button disabled={busy === row._id} onClick={() => review(row._id, "verified")}>Approve</button><button disabled={busy === row._id} onClick={() => review(row._id, "rejected")}>Reject</button></div> : "Reviewed"}</td></tr>)}</tbody></table></div></div>;
}
