import { useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { loginAffiliateMember } from "../../api/affiliateApi";
import { isAffiliateSession, saveSession } from "../../store/auth";
// import "../../styles/affiliateMember.css";

export default function AffiliateMemberLogin() {
  const nav = useNavigate();
  const [affiliateId, setAffiliateId] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAffiliateSession()) return <Navigate to="/affiliate-member/dashboard" replace />;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const { data } = await loginAffiliateMember(affiliateId, password);
      saveSession(data.token, "affiliate");
      sessionStorage.setItem("affiliate_login_toast", data.message || "Joined as Affiliate Member");
      nav("/affiliate-member/dashboard", { replace: true });
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Affiliate login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="amAuthPage">
      <section className="amAuthCard">
        <span className="amEyebrow">AFFILIATE MEMBER CRM</span>
        <h1>Affiliate Login</h1>
        <p>Use the Affiliate ID sent to your email and your existing HomeQR account password.</p>
        <form className="amForm" onSubmit={submit}>
          <input placeholder="Affiliate ID (e.g. AFF-000001)" value={affiliateId} onChange={(e) => setAffiliateId(e.target.value.toUpperCase())} required />
          <input type="password" placeholder="Existing account password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button className="amPrimary" disabled={loading}>{loading ? "Logging in..." : "Login as Affiliate"}</button>
        </form>
        {message && <p className="amMessage error">{message}</p>}
        <p className="amAuthFoot">Not approved yet? <Link to="/affiliate-member/join">Check application</Link></p>
      </section>
    </main>
  );
}
