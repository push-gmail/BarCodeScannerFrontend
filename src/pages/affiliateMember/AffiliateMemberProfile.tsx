import { useEffect, useState } from "react";
import { getAffiliateMe, updateAffiliateProfile } from "../../api/affiliateApi";

export default function AffiliateMemberProfile() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", country: "", pincode: "", affiliateId: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const load = () => getAffiliateMe().then(({ data }) => setForm({
    name: data.user?.name || "",
    email: data.user?.email || "",
    phone: data.user?.phone || "",
    country: data.user?.country || "",
    pincode: data.user?.pincode || "",
    affiliateId: data.affiliateId || "",
  }));

  useEffect(() => { load().catch(() => setMessage("Could not load profile")); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setMessage("");
    try {
      const { data } = await updateAffiliateProfile({ name: form.name, phone: form.phone, country: form.country, pincode: form.pincode });
      setMessage(data.message || "Profile updated");
      await load();
    } catch (error: any) { setMessage(error?.response?.data?.message || "Profile update failed"); }
    finally { setLoading(false); }
  };

  return <div className="amPanel narrow"><span className="amEyebrow">SETTINGS / PROFILE</span><h1>Profile</h1><form className="amForm" onSubmit={submit}>
    <label>Affiliate ID<input value={form.affiliateId} disabled /></label>
    <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
    <label>Email<input value={form.email} disabled /></label>
    <label>Phone<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
    <div className="amTwoCol"><label>Country<input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></label><label>Pincode<input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} /></label></div>
    <button className="amPrimary" disabled={loading}>{loading ? "Saving..." : "Save Profile"}</button>
  </form>{message && <p className="amMessage">{message}</p>}</div>;
}
