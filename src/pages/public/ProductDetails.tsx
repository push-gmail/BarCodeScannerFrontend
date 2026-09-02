import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Header from "../../components/Header";
import AuthModal from "../../components/AuthModal";

import {
  getPublicCategoryProduct,
  type PublicCategoryProduct,
} from "../../api/publicApi";

import { addCategoryProductToCart } from "../../api/userApi";

import { isUserSession } from "../../store/auth";

type ProductSpecification = {
  label: string;
  key: string;
  value?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
};

export default function ProductDetails() {
  const {
    slug = "",
    productId = "",
    imageIndex = "0",
  } = useParams();

  const nav = useNavigate();

  const [product, setProduct] =
    useState<PublicCategoryProduct | null>(null);

  const [values, setValues] = useState<
    Record<string, string>
  >({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [loginOpen, setLoginOpen] =
    useState(false);

  const selectedIndex = Math.max(
    0,
    Number(imageIndex) || 0,
  );

  const selectedImage = useMemo(
    () => product?.images?.[selectedIndex],
    [product, selectedIndex],
  );

  useEffect(() => {
    let mounted = true;

    setLoading(true);
    setError("");

    getPublicCategoryProduct(slug)
      .then(({ data }) => {
        if (!mounted) return;

        if (data.product._id !== productId) {
          throw new Error("Product not found");
        }

        setProduct(data.product);

        const initial: Record<string, string> =
          {};

        (
          data.product
            .specifications as ProductSpecification[]
        ).forEach((spec) => {
          initial[spec.key] =
            String(spec.value || "");
        });

        setValues(initial);
      })
      .catch((err) => {
        if (!mounted) return;

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Product not found",
        );
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [slug, productId]);

  const changeSpecificationValue = (
    key: string,
    value: string,
  ) => {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const add = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!product) return;

    if (!isUserSession()) {
      setLoginOpen(true);
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const { data } =
        await addCategoryProductToCart({
          categoryProductId: productId,
          imageIndex: selectedIndex,
          specificationValues: values,
          quantity: 1,
        });

      setMessage(
        data.message || "Added to cart",
      );

      window.dispatchEvent(
        new CustomEvent("cart:changed", {
          detail: {
            count: data.count,
          },
        }),
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Could not add to cart",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header
          onLogin={() => setLoginOpen(true)}
        />

        <main className="productDetailsPage">
          <div className="panel masterEmpty">
            Loading...
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header
        onLogin={() => setLoginOpen(true)}
      />

      <main className="productDetailsPage">
        {error && !product ? (
          <div className="panel masterProductError">
            {error}
          </div>
        ) : product && selectedImage ? (
          <div className="productDetailsGrid">
            <section className="panel productImagePanel">
              <button
                type="button"
                className="secondaryAction"
                onClick={() =>
                  nav(`/category/${slug}`)
                }
              >
                ← Back
              </button>

              <img
                src={selectedImage.url}
                alt={`${product.categoryId.name} product`}
              />

              <h2>
                {product.categoryId.name}
              </h2>

              <div className="productDetailPrice">
                ₹
                {Number(
                  product.price,
                ).toFixed(2)}
              </div>
            </section>

            <section className="panel">
              <h2>Specifications</h2>

              <form
                className="publicSpecificationForm"
                onSubmit={add}
              >
                {(
                  product.specifications as ProductSpecification[]
                ).map((spec) => (
                  <label key={spec.key}>
                    {spec.label}

                    <input
                      type="text"
                      value={
                        values[spec.key] || ""
                      }
                      onChange={(event) =>
                        changeSpecificationValue(
                          spec.key,
                          event.target.value,
                        )
                      }
                    />
                  </label>
                ))}

                {error && (
                  <div className="masterProductError">
                    {error}
                  </div>
                )}

                {message && (
                  <div className="success">
                    {message}
                  </div>
                )}

                <button
                  className="primary full"
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? "Adding..."
                    : "Add to Cart"}
                </button>
              </form>
            </section>
          </div>
        ) : (
          <div className="panel masterProductError">
            Selected image not found.
          </div>
        )}
      </main>

      <AuthModal
        open={loginOpen}
        onClose={() =>
          setLoginOpen(false)
        }
        onLoggedIn={() => {
          setLoginOpen(false);

          window.dispatchEvent(
            new Event("auth:changed"),
          );
        }}
      />
    </>
  );
}