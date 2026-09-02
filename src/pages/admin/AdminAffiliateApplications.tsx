import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { getAffiliateApplications, reviewAffiliateApplication } from "../../api/adminApi";

export default function AdminAffiliateApplications() {
  const [rows, setRows] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState("");

  const load = () => getAffiliateApplications().then((r) => setRows(Array.isArray(r.data) ? r.data : []));
  useEffect(() => { load().catch(() => setMessage("Could not load affiliate applications")); }, []);

  const review = async (id: string, status: "approved" | "rejected") => {
    let reason = "";
    if (status === "rejected") reason = window.prompt("Reason for rejection") || "Rejected by admin";
    setBusy(id); setMessage("");
    try {
      const { data } = await reviewAffiliateApplication(id, status, reason);
      setMessage(data.message || `Application ${status}`);
      await load();
    } catch (error: any) { setMessage(error?.response?.data?.message || "Could not update application"); }
    finally { setBusy(""); }
  };

  return <div><h1>Join As Affiliate</h1><p>Review users who requested Affiliate Membership.</p>{message && <p className="formMessage">{message}</p>}<div className="tableWrap"><table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Applied At</th><th>Status</th><th>Actions</th></tr></thead><tbody>{rows.map((row) => <tr key={row._id}><td>{row.userId?.name || "-"}</td><td>{row.userId?.email || "-"}</td><td>{row.userId?.phone || "-"}</td><td>{row.appliedAt ? new Date(row.appliedAt).toLocaleString() : "-"}</td><td>{row.status}</td><td>{row.status === "pending" ? <div className="cardActions"><button disabled={busy === row._id} onClick={() => review(row._id, "approved")} title="Approve"><Check size={17} /></button><button disabled={busy === row._id} onClick={() => review(row._id, "rejected")} title="Reject"><X size={17} /></button></div> : "Reviewed"}</td></tr>)}</tbody></table></div></div>;
}
