import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerForAffiliateJourney } from "../../api/affiliateApi";
// import "../../styles/affiliateMember.css";

export default function AffiliateRegister() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: "",
    country: "India",
    pincode: "",
    email: "",
    phone: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await registerForAffiliateJourney(form);
      nav("/affiliate-member/join", {
        replace: true,
        state: { email: form.email, registered: true },
      });
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="amAuthPage">
      <section className="amAuthCard">
        <span className="amEyebrow">HOMEQR AFFILIATE PROGRAM</span>
        <h1>Become an Affiliate Member</h1>
        <p>Create your HomeQR account first. After login, your affiliate application can be submitted to admin.</p>
        <form className="amForm" onSubmit={submit}>
          <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <div className="amTwoCol">
            <input placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} required />
            <input placeholder="Pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} required />
          </div>
          <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input type="tel" placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input type="password" minLength={6} placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <button className="amPrimary" disabled={loading}>{loading ? "Creating account..." : "Register"}</button>
        </form>
        {message && <p className="amMessage error">{message}</p>}
        <p className="amAuthFoot">Already registered? <Link to="/affiliate-member/join">Login and apply</Link></p>
      </section>
    </main>
  );
}
