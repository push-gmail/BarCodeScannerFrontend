import { useEffect, useState } from "react";
import { getAdminUsers, updateAdminUserStatus } from "../../api/adminApi";

export default function AdminUsers() {
  const [rows, setRows] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const load = () => getAdminUsers().then((r) => setRows(Array.isArray(r.data) ? r.data : []));
  useEffect(() => { load().catch(() => setMessage("Could not load users")); }, []);
  const setStatus = async (id: string, status: string) => {
    try { await updateAdminUserStatus(id, status); await load(); }
    catch (error: any) { setMessage(error?.response?.data?.message || "Could not update user"); }
  };
  return <div><h1>Users</h1>{message && <p className="formMessage">{message}</p>}<div className="tableWrap"><table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Actions</th></tr></thead><tbody>{rows.map((u) => <tr key={u._id}><td>{u.name}</td><td>{u.email}</td><td>{u.phone}</td><td>{u.status}</td><td><button onClick={() => setStatus(u._id, "approved")}>Approve</button><button onClick={() => setStatus(u._id, "rejected")}>Reject</button></td></tr>)}</tbody></table></div></div>;
}
