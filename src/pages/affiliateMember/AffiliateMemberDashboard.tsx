import { useEffect, useState } from "react";
import { getAffiliateMe } from "../../api/affiliateApi";

export default function AffiliateMemberDashboard() {
  const [me, setMe] = useState<any>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getAffiliateMe().then((r) => setMe(r.data)).catch((e) => setMessage(e?.response?.data?.message || "Could not load dashboard"));
  }, []);

  if (!me) return <div className="amPanel"><p>{message || "Loading..."}</p></div>;

  return <div>
    <div className="amPageHead"><div><span className="amEyebrow">AFFILIATE DASHBOARD</span><h1>Welcome, {me.user?.name}</h1><p>Your membership is active. Complete KYC before withdrawals are enabled.</p></div></div>
    <div className="amStats">
      <div><span>Affiliate ID</span><strong>{me.affiliateId}</strong></div>
      <div><span>Affiliate Status</span><strong>{me.status}</strong></div>
      <div><span>KYC Status</span><strong>{String(me.kycStatus).replace("_", " ")}</strong></div>
      <div><span>Joined At</span><strong>{me.joinedAt ? new Date(me.joinedAt).toLocaleDateString() : "First login pending"}</strong></div>
    </div>
    {me.kycStatus !== "verified" && <div className="amNotice"><b>KYC rule:</b> You can view and share products now, but commission withdrawal will remain locked until KYC is verified.</div>}
  </div>;
}
