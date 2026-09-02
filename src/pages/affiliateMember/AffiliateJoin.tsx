import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  getAffiliateApplicationStatus,
  joinAffiliate,
  loginUserForAffiliateJourney,
} from "../../api/affiliateApi";
import { isUserSession, saveSession } from "../../store/auth";
// import "../../styles/affiliateMember.css";

export default function AffiliateJoin() {
  const location = useLocation();
  const initialEmail = (location.state as any)?.email || "";
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(isUserSession());

  const loadStatus = async () => {
    if (!isUserSession()) return;
    try {
      const { data } = await getAffiliateApplicationStatus();
      setStatus(data);
    } catch {
      // No application yet is fine.
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const { data } = await loginUserForAffiliateJourney(email, password);
      saveSession(data.token, "user");
      setLoggedIn(true);
      setMessage("Login successful. You can now submit your affiliate application.");
      setTimeout(loadStatus, 0);
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const apply = async () => {
    setLoading(true);
    setMessage("");
    try {
      const { data } = await joinAffiliate();
      setMessage(data.message || "Affiliate application submitted");
      await loadStatus();
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Could not submit application");
    } finally {
      setLoading(false);
    }
  };

  const application = status?.application;
  const affiliate = status?.affiliate;

  return (
    <main className="amAuthPage">
      <section className="amAuthCard wide">
        <span className="amEyebrow">JOIN AS AFFILIATE</span>
        <h1>Affiliate Membership Application</h1>
        {!loggedIn ? (
          <>
            <p>Login using your normal HomeQR email and password. This does not yet log you into the Affiliate CRM.</p>
            <form className="amForm" onSubmit={login}>
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button className="amPrimary" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
            </form>
            <p className="amAuthFoot">New user? <Link to="/affiliate-member/register">Register first</Link></p>
          </>
        ) : affiliate?.status === "approved" ? (
          <div className="amStatusBox success">
            <h3>You are already an approved Affiliate Member</h3>
            <p>Affiliate ID: <strong>{affiliate.affiliateId}</strong></p>
            <Link className="amPrimary link" to="/affiliate-member/login">Login as Affiliate</Link>
          </div>
        ) : application?.status === "pending" ? (
          <div className="amStatusBox pending">
            <h3>Application Pending</h3>
            <p>Your application is waiting for admin approval.</p>
            <p>Applied: {new Date(application.appliedAt).toLocaleString()}</p>
          </div>
        ) : (
          <div className="amStatusBox">
            {application?.status === "rejected" && (
              <p className="amMessage error">Previous application rejected: {application.rejectionReason || "No reason provided"}</p>
            )}
            <p>Submit your request. Admin will review your name, email and phone before approving membership.</p>
            <button className="amPrimary" onClick={apply} disabled={loading}>{loading ? "Submitting..." : "Join As Affiliate"}</button>
          </div>
        )}
        {message && <p className="amMessage">{message}</p>}
      </section>
    </main>
  );
}
