import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Eye,
  ImagePlus,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";

import {
  createMasterCategoryProduct,
  deleteMasterCategoryProduct,
  getMasterCategories,
  getMasterCategoryProducts,
  updateMasterCategoryProduct,
  type MasterCategory,
  type MasterCategoryProduct,
  type MasterSpecification,
} from "../../api/masterApi";

type SpecificationDraft = MasterSpecification & {
  value: string;
};

const emptySpecification = (): SpecificationDraft => ({
  label: "",
  key: "",
  value: "",
  type: "text",
  required: false,
  placeholder: "",
  options: [],
});

const toKey = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

export default function MasterCategoryProducts() {
  const [categories, setCategories] = useState<MasterCategory[]>([]);
  const [products, setProducts] = useState<MasterCategoryProduct[]>([]);

  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  const [specifications, setSpecifications] = useState<SpecificationDraft[]>([
    emptySpecification(),
  ]);

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] =
    useState<MasterCategoryProduct["images"]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [viewProduct, setViewProduct] =
    useState<MasterCategoryProduct | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const activeCategories = useMemo(
    () => categories.filter((category) => category.status === "active"),
    [categories],
  );

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [categoryResponse, productResponse] = await Promise.all([
        getMasterCategories(),
        getMasterCategoryProducts(),
      ]);

      setCategories(categoryResponse.data.categories || []);
      setProducts(productResponse.data.products || []);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to load master products",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const urls = images.map((file) => URL.createObjectURL(file));
    setImagePreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  useEffect(() => {
    const portalOpen = formOpen || Boolean(viewProduct);

    if (!portalOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      if (viewProduct) {
        setViewProduct(null);
        return;
      }

      if (formOpen && !saving) {
        closeForm();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [formOpen, viewProduct, saving]);

  const resetFormFields = () => {
    setCategoryId("");
    setPrice("");
    setStatus("active");
    setSpecifications([emptySpecification()]);
    setImages([]);
    setExistingImages([]);
    setEditingId(null);
  };

  const openCreate = () => {
    resetFormFields();
    setMessage("");
    setError("");
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;

    setFormOpen(false);
    resetFormFields();
    setError("");
  };

  const changeSpecification = (
    index: number,
    field: "label" | "value",
    value: string,
  ) => {
    setSpecifications((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        if (field === "label") {
          return {
            ...item,
            label: value,
            key: toKey(value),
          };
        }

        return {
          ...item,
          value,
        };
      }),
    );
  };

  const addSpecification = () => {
    setSpecifications((current) => [...current, emptySpecification()]);
  };

  const removeSpecification = (index: number) => {
    setSpecifications((current) => {
      if (current.length === 1) return [emptySpecification()];

      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  const editProduct = (product: MasterCategoryProduct) => {
    setEditingId(product._id);
    setCategoryId(product.categoryId?._id || "");
    setPrice(String(product.price));
    setStatus(product.status);
    setExistingImages(product.images || []);
    setImages([]);

    setSpecifications(
      product.specifications?.length
        ? product.specifications.map((specification) => ({
            ...specification,
            value: String((specification as any).value || ""),
            type: "text",
            required: false,
            placeholder: "",
            options: [],
          }))
        : [emptySpecification()],
    );

    setMessage("");
    setError("");
    setViewProduct(null);
    setFormOpen(true);
  };

  const handleImages = (files: FileList | null) => {
    const selected = Array.from(files || []);

    if (selected.length > 10) {
      setError("You can upload maximum 10 images at a time.");
    } else {
      setError("");
    }

    setImages(selected.slice(0, 10));
  };

  const buildSpecifications = () =>
    specifications
      .filter((item) => item.label.trim())
      .map((item) => ({
        label: item.label.trim(),
        key: toKey(item.label),
        value: item.value.trim(),
        type: "text" as const,
        required: false,
        placeholder: "",
        options: [],
      }));

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      if (!categoryId) {
        setError("Please select a category");
        return;
      }

      const numericPrice = Number(price);

      if (!Number.isFinite(numericPrice) || numericPrice < 0) {
        setError("Please enter a valid price");
        return;
      }

      const finalSpecifications = buildSpecifications();

      if (finalSpecifications.length === 0) {
        setError("Please add at least one specification.");
        return;
      }

      const keys = finalSpecifications.map((item) => item.key);
      const duplicateKey = keys.find(
        (key, index) => keys.indexOf(key) !== index,
      );

      if (duplicateKey) {
        setError(
          "Please use different specification names.",
        );
        return;
      }

      if (!editingId && images.length === 0) {
        setError("Please upload at least one QR image");
        return;
      }

      const formData = new FormData();
      formData.append("categoryId", categoryId);
      formData.append("price", String(numericPrice));
      formData.append("status", status);
      formData.append("specifications", JSON.stringify(finalSpecifications));

      images.forEach((file) => formData.append("images", file));

      if (editingId) {
        const response = await updateMasterCategoryProduct(
          editingId,
          formData,
        );

        setMessage(
          response.data?.message || "Product updated successfully",
        );
      } else {
        const response = await createMasterCategoryProduct(formData);

        setMessage(
          response.data?.message || "Product created successfully",
        );
      }

      setFormOpen(false);
      resetFormFields();
      await loadData();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Unable to save. Make sure every uploaded image contains a readable QR code.",
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (id: string) => {
    const confirmed = window.confirm(
      "Delete this category product? Its stored QR images will also be deleted.",
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await deleteMasterCategoryProduct(id);
      await loadData();

      if (editingId === id) {
        setFormOpen(false);
        resetFormFields();
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to delete product",
      );
    }
  };

  const productFormPortal =
    formOpen && typeof document !== "undefined"
      ? createPortal(
          <div
            className="masterProductPortalBackdrop"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !saving) {
                closeForm();
              }
            }}
          >
            <section
              className="masterProductPortal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="master-product-modal-title"
            >
              <div className="masterProductPortalHead">
                <div>
                  <span className="eyebrow">MASTER PRODUCT</span>
                  <h2 id="master-product-modal-title">
                    {editingId ? "Edit Product" : "Add Product"}
                  </h2>
                </div>

                <button
                  type="button"
                  className="masterProductPortalClose"
                  onClick={closeForm}
                  disabled={saving}
                  aria-label="Close product form"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={submit} className="masterProductPortalForm">
                <div className="masterProductTopGrid">
                  <label>
                    Category
                    <select
                      value={categoryId}
                      onChange={(event) =>
                        setCategoryId(event.target.value)
                      }
                      required
                    >
                      <option value="">Select category</option>

                      {activeCategories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Price
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(event) => setPrice(event.target.value)}
                      required
                    />
                  </label>

                  <label>
                    Status
                    <select
                      value={status}
                      onChange={(event) =>
                        setStatus(
                          event.target.value as "active" | "inactive",
                        )
                      }
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </label>
                </div>

                <section className="masterProductSpecSection simpleMasterSpecs">
                  <div className="specificationHead">
                    <h3>Specifications</h3>

                    <button
                      type="button"
                      className="secondaryAction"
                      onClick={addSpecification}
                    >
                      <Plus size={16} />
                      Add Field
                    </button>
                  </div>

                  <div className="masterSimpleSpecTableWrap">
                    <table className="masterSimpleSpecTable">
                      <thead>
                        <tr>
                          <th>Field Name</th>
                          <th>Value</th>
                          <th>Remove</th>
                        </tr>
                      </thead>

                      <tbody>
                        {specifications.map((specification, index) => (
                          <tr key={index}>
                            <td>
                              <input
                                value={specification.label}
                                onChange={(event) =>
                                  changeSpecification(
                                    index,
                                    "label",
                                    event.target.value,
                                  )
                                }
                              />
                            </td>

                            <td>
                              <input
                                value={specification.value}
                                onChange={(event) =>
                                  changeSpecification(
                                    index,
                                    "value",
                                    event.target.value,
                                  )
                                }
                              />
                            </td>

                            <td>
                              <button
                                type="button"
                                className="deleteAction masterSpecDelete"
                                onClick={() => removeSpecification(index)}
                                title="Remove specification"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="masterProductImagesSection">
                  <div className="simpleSectionTitle">
                    <h3>Images</h3>
                  </div>

                  <label className="masterImageUploadLabel">
                    <ImagePlus size={24} />
                    <strong>Choose Images</strong>

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      multiple
                      onChange={(event) =>
                        handleImages(event.target.files)
                      }
                    />
                  </label>

                  {existingImages.length > 0 && images.length === 0 && (
                    <div>
                      <small className="masterProductImageLabel">
                        Existing images
                      </small>

                      <div className="masterProductPortalImages">
                        {existingImages.map((image) => (
                          <div
                            className="masterProductPortalImage"
                            key={image.filename}
                          >
                            <img src={image.url} alt="Stored QR" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {images.length > 0 && (
                    <div>
                      <small className="masterProductImageLabel">
                        Selected images ({images.length})
                      </small>

                      <div className="masterProductPortalImages">
                        {images.map((file, index) => (
                          <div
                            className="masterProductPortalImage"
                            key={`${file.name}-${file.size}-${index}`}
                          >
                            <img
                              src={imagePreviewUrls[index]}
                              alt={file.name}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>

                {error && (
                  <div className="masterProductError">{error}</div>
                )}

                <div className="masterProductPortalActions">
                  <button
                    type="button"
                    className="secondaryAction"
                    onClick={closeForm}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="primary"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : editingId
                        ? "Update Product"
                        : "Save Product"}
                  </button>
                </div>
              </form>
            </section>
          </div>,
          document.body,
        )
      : null;

  const viewPortal =
    viewProduct && typeof document !== "undefined"
      ? createPortal(
          <div
            className="masterProductPortalBackdrop"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setViewProduct(null);
              }
            }}
          >
            <section
              className="masterProductViewPortal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="master-product-view-title"
            >
              <div className="masterProductPortalHead">
                <div>
                  <span className="eyebrow">PRODUCT DETAILS</span>
                  <h2 id="master-product-view-title">
                    {viewProduct.categoryId?.name || "Category Product"}
                  </h2>
                  <p>
                    Saved price, specifications, images and current status.
                  </p>
                </div>

                <button
                  type="button"
                  className="masterProductPortalClose"
                  onClick={() => setViewProduct(null)}
                  aria-label="Close product details"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="masterProductViewSummary">
                <div>
                  <span>Category</span>
                  <strong>{viewProduct.categoryId?.name || "-"}</strong>
                </div>

                <div>
                  <span>Price</span>
                  <strong>
                    ₹{Number(viewProduct.price || 0).toFixed(2)}
                  </strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>{viewProduct.status}</strong>
                </div>
              </div>

              <div className="masterProductViewBlock">
                <h3>Specifications</h3>

                <div className="masterSimpleSpecTableWrap">
                  <table className="masterSimpleSpecTable">
                    <thead>
                      <tr>
                        <th>Field Name</th>
                        <th>Value</th>
                      </tr>
                    </thead>

                    <tbody>
                      {(viewProduct.specifications || []).map(
                        (specification, index) => (
                          <tr key={`${specification.key}-${index}`}>
                            <td>{specification.label || "-"}</td>
                            <td>{String((specification as any).value || "-")}</td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="masterProductViewBlock">
                <h3>Images</h3>

                <div className="masterProductPortalImages">
                  {(viewProduct.images || []).map((image) => (
                    <div
                      className="masterProductPortalImage"
                      key={image.filename}
                    >
                      <img src={image.url} alt="Product QR" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="masterProductPortalActions">
                <button
                  type="button"
                  className="secondaryAction"
                  onClick={() => setViewProduct(null)}
                >
                  Close
                </button>

                <button
                  type="button"
                  className="primary"
                  onClick={() => editProduct(viewProduct)}
                >
                  <Pencil size={16} />
                  Edit Product
                </button>
              </div>
            </section>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div className="masterProductsPage">
        <div className="pageHead masterProductsPageHead">
          <div>
            <span className="eyebrow">MASTER DATA</span>
            <h1>Category Products</h1>
          </div>

          <div className="masterPageActions">
            <button
              type="button"
              className="secondaryAction"
              onClick={loadData}
              disabled={loading}
            >
              <RefreshCw
                size={17}
                className={loading ? "masterRefreshSpin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              className="primary"
              onClick={openCreate}
            >
              <Plus size={17} />
              Add Product
            </button>
          </div>
        </div>

        {error && !formOpen && (
          <div className="masterProductError">{error}</div>
        )}

        {message && !formOpen && (
          <div className="success">{message}</div>
        )}

        <section className="panel masterProductsTablePanel">
          <div className="masterFormHead">
            <div>
              <h2>Saved Products</h2>
              <p>{products.length} configuration(s)</p>
            </div>
          </div>

          {loading ? (
            <div className="masterEmpty">Loading...</div>
          ) : products.length === 0 ? (
            <div className="masterEmpty">
              No category products added yet.
            </div>
          ) : (
            <div className="tableWrap masterProductsTableWrap">
              <table className="masterProductsTable">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Specifications</th>
                    <th>Images</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td>
                        <strong>{product.categoryId?.name || "-"}</strong>
                      </td>

                      <td>
                        ₹{Number(product.price || 0).toFixed(2)}
                      </td>

                      <td>
                        <div className="masterSpecificationSummary">
                          {(product.specifications || [])
                            .slice(0, 4)
                            .map((specification) => (
                              <span key={specification.key}>
                                {specification.label}
                                {String((specification as any).value || "").trim()
                                  ? `: ${String((specification as any).value)}`
                                  : ""}
                              </span>
                            ))}

                          {(product.specifications?.length || 0) > 4 && (
                            <small>
                              +{product.specifications.length - 4} more
                            </small>
                          )}

                          {(product.specifications?.length || 0) === 0 && (
                            <small>No specifications</small>
                          )}
                        </div>
                      </td>

                      <td>
                        <div className="masterProductThumbs">
                          {(product.images || [])
                            .slice(0, 3)
                            .map((image) => (
                              <img
                                key={image.filename}
                                src={image.url}
                                alt="QR"
                              />
                            ))}

                          {(product.images?.length || 0) > 3 && (
                            <span>+{product.images.length - 3}</span>
                          )}
                        </div>
                      </td>

                      <td>
                        <span
                          className={`statusBadge ${
                            product.status === "active"
                              ? "statusActive"
                              : "statusInactive"
                          }`}
                        >
                          {product.status}
                        </span>
                      </td>

                      <td>
                        <div className="categoryActions">
                          <button
                            type="button"
                            className="secondaryAction masterProductViewAction"
                            onClick={() => setViewProduct(product)}
                          >
                            <Eye size={15} />
                            View
                          </button>

                          <button
                            type="button"
                            className="editAction"
                            onClick={() => editProduct(product)}
                          >
                            <Pencil size={15} />
                            Edit
                          </button>

                          <button
                            type="button"
                            className="deleteAction"
                            onClick={() => deleteProduct(product._id)}
                          >
                            <Trash2 size={15} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {productFormPortal}
      {viewPortal}
    </>
  );
}
