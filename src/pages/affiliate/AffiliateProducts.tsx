import { useEffect, useState } from "react";
import { BACKEND_URL } from "../../api/client";
import { getProducts } from "../../api/userApi";

export default function AffiliateProducts() {
  const [rows, setRows] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getProducts().then((r) => setRows(r.data)).catch((e) => setMessage(e?.response?.data?.message || "Could not load products"));
  }, []);

  return (
    <div>
      <span className="eyebrow">AFFILIATE PORTAL</span>
      <h1>My Products</h1>
      <p>Only Home-category products approved by admin and linked with a QR code appear here.</p>
      {message && <p>{message}</p>}
      <div className="cards">
        {rows.map((x) => (
          <div className="productCard" key={x._id}>
            <h3>{x.homeItemId?.title || "Home item"}</h3>
            <p>{x.homeItemId?.itemType}</p>
            <p><b>{x.code}</b></p>
            <img src={`${BACKEND_URL}${x.qrImagePath}`} alt={`QR ${x.code}`} />
            <div className="cardActions">
              <a className="primary anchor" href={`${BACKEND_URL}${x.pdfPath}`} target="_blank" rel="noreferrer">Download QR PDF</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
