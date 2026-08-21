import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { loginAffiliate } from "../../api/authApi";
import { isUserSession, saveSession } from "../../store/auth";

export default function AffiliateLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (isUserSession()) return <Navigate to="/affiliate/dashboard" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const { data } = await loginAffiliate(email, password);
      saveSession(data.token, "user");
      nav("/affiliate/dashboard", { replace: true });
    } catch (err: any) {
      setMessage(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="affiliateLoginPage">
      <section className="affiliateLoginCard">
        <span className="eyebrow">AFFILIATE WEB PORTAL</span>
        <h1>Login with your HomeQR account</h1>
        <p>Use the same email and password that you created on the main ecommerce website.</p>
        <form onSubmit={submit}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button className="primary full" disabled={loading}>{loading ? "Logging in..." : "Login to Affiliate Portal"}</button>
        </form>
        {message && <p className="formMessage">{message}</p>}
        <button className="linkBtn" onClick={() => nav("/")}>Back to ecommerce website</button>
      </section>
    </main>
  );
}
