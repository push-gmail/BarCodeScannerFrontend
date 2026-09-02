import { useEffect, useState } from "react";
import { getAffiliateMembers } from "../../api/adminApi";

export default function AdminAffiliateMembers() {
  const [rows, setRows] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  useEffect(() => { getAffiliateMembers().then((r) => setRows(Array.isArray(r.data) ? r.data : [])).catch(() => setMessage("Could not load affiliate members")); }, []);
  return <div><h1>Affiliate Members</h1><p>Passwords are never displayed. Members login using Affiliate ID and their existing account password.</p>{message && <p className="formMessage">{message}</p>}<div className="tableWrap"><table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Affiliate ID</th><th>Applied At</th><th>Approved At</th><th>Joined At</th><th>Last Login</th><th>KYC</th><th>Status</th></tr></thead><tbody>{rows.map((row) => <tr key={row._id}><td>{row.userId?.name || "-"}</td><td>{row.userId?.email || "-"}</td><td>{row.userId?.phone || "-"}</td><td><b>{row.affiliateId}</b></td><td>{row.applicationId?.appliedAt ? new Date(row.applicationId.appliedAt).toLocaleString() : "-"}</td><td>{row.approvedAt ? new Date(row.approvedAt).toLocaleString() : "-"}</td><td>{row.joinedAt ? new Date(row.joinedAt).toLocaleString() : "Not logged in"}</td><td>{row.lastLoginAt ? new Date(row.lastLoginAt).toLocaleString() : "-"}</td><td>{row.kycStatus}</td><td>{row.status}</td></tr>)}</tbody></table></div></div>;
}
