import { useEffect, useState } from "react";
import { Copy, ExternalLink, MessageCircle } from "lucide-react";
import { BACKEND_URL } from "../../api/client";
import { getAffiliateMe, getAffiliateProducts } from "../../api/affiliateApi";

function mediaUrl(value?: string) {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `${BACKEND_URL}/${value.replace(/^\/+/, "")}`;
}

export default function AffiliateMemberProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [affiliateId, setAffiliateId] = useState("");
  const [copied, setCopied] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    Promise.all([getAffiliateProducts(), getAffiliateMe()])
      .then(([p, m]) => { setProducts(Array.isArray(p.data) ? p.data : []); setAffiliateId(m.data.affiliateId); })
      .catch((e) => setMessage(e?.response?.data?.message || "Could not load products"));
  }, []);

  const productLink = (product: any, imageIndex = 0) => {
    const slug = product.categoryId?.slug || "home";
    return `${window.location.origin}/category/${slug}/product/${product._id}/image/${imageIndex}?ref=${encodeURIComponent(affiliateId)}`;
  };

  const copy = async (product: any) => {
    const link = productLink(product);
    await navigator.clipboard.writeText(link);
    setCopied(product._id);
    window.setTimeout(() => setCopied(""), 1800);
  };

  const shareWhatsApp = (product: any) => {
    const name = product.categoryId?.name || "HomeQR Product";
    const text = `Check this product:\n${name}\n₹${Number(product.price || 0).toFixed(2)}\n${productLink(product)}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  return <div>
    <div className="amPageHead"><div><span className="amEyebrow">MY PRODUCTS</span><h1>Share & Earn</h1><p>Each link automatically contains your Affiliate ID: <b>{affiliateId || "..."}</b></p></div></div>
    {message && <p className="amMessage error">{message}</p>}
    <div className="amProductGrid">
      {products.map((product) => {
        const image = product.images?.[0];
        const link = productLink(product);
        return <article className="amProductCard" key={product._id}>
          {image?.url || image?.path ? <img src={mediaUrl(image.url || image.path)} alt={product.categoryId?.name || "Product"} /> : <div className="amProductPlaceholder">HomeQR</div>}
          <div className="amProductBody">
            <span className="amProductStatus">Active product</span>
            <h3>{product.categoryId?.name || "HomeQR Product"}</h3>
            <strong className="amPrice">₹{Number(product.price || 0).toFixed(2)}</strong>
            <div className="amReferralLink">{link}</div>
            <div className="amActions">
              <button onClick={() => copy(product)}><Copy size={16} /> {copied === product._id ? "Copied" : "Copy Link"}</button>
              <button onClick={() => shareWhatsApp(product)}><MessageCircle size={16} /> WhatsApp</button>
              <a href={link} target="_blank" rel="noreferrer"><ExternalLink size={16} /> View</a>
            </div>
          </div>
        </article>;
      })}
      {!products.length && !message && <div className="amEmpty">No active affiliate products available.</div>}
    </div>
  </div>;
}
