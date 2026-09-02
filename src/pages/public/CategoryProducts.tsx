import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header";
import AuthModal from "../../components/AuthModal";
import { getPublicCategoryProduct, type PublicCategoryProduct } from "../../api/publicApi";

export default function CategoryProducts() {
  const { slug = "" } = useParams();
  const nav = useNavigate();
  const [product, setProduct] = useState<PublicCategoryProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError("");
    getPublicCategoryProduct(slug)
      .then(({ data }) => setProduct(data.product))
      .catch((err) => setError(err?.response?.data?.message || "No products available"))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <>
      <Header onLogin={() => setLoginOpen(true)}/>
      <main className="catalogPage">
        <div className="catalogHead">
          <span className="eyebrow">{slug.toUpperCase()} CATEGORY</span>
          <h1>{product?.categoryId?.name || slug.toUpperCase()} Products</h1>
          <p>Select any image to view its specifications and add it to your cart.</p>
        </div>

        {loading ? <div className="panel masterEmpty">Loading products...</div> : error ? (
          <div className="panel masterProductError">{error}</div>
        ) : product ? (
          <div className="publicProductGrid">
            {product.images.map((image, index) => (
              <button
                type="button"
                className="publicProductCard"
                key={`${image.filename}-${index}`}
                onClick={() => nav(`/category/${slug}/product/${product._id}/image/${index}`)}
              >
                <img src={image.url} alt={`${product.categoryId.name} QR product ${index + 1}`}/>
                <div className="publicProductCardBody">
                  <strong>{product.categoryId.name}</strong>
                  <span>₹{Number(product.price).toFixed(2)}</span>
                  <small>View details</small>
                </div>
              </button>
            ))}
          </div>
        ) : null}
      </main>
      <AuthModal open={loginOpen} onClose={() => setLoginOpen(false)} onLoggedIn={() => setLoginOpen(false)}/>
    </>
  );
}
