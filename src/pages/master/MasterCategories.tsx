import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Edit3, Plus, RefreshCw, Trash2, X } from "lucide-react";

import {
  createMasterCategory,
  deleteMasterCategory,
  getMasterCategories,
  updateMasterCategory,
  type CategoryPayload,
  type MasterCategory,
} from "../../api/masterApi";

const emptyForm: CategoryPayload = {
  name: "",
  slug: "",
  description: "",
  status: "active",
};

export default function MasterCategories() {
  const [categories, setCategories] = useState<MasterCategory[]>([]);
  const [form, setForm] = useState<CategoryPayload>(emptyForm);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [msg, setMsg] = useState("");

  const loadCategories = async () => {
    setLoading(true);
    setMsg("");

    try {
      const { data } = await getMasterCategories();
      setCategories(data.categories || []);
    } catch (err: any) {
      setMsg(err?.response?.data?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (!formOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) {
        closeForm();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [formOpen, saving]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setMsg("");
    setFormOpen(true);
  };

  const openEdit = (category: MasterCategory) => {
    setEditingId(category._id);

    setForm({
      name: category.name,
      slug: category.slug || "",
      description: category.description || "",
      status: category.status,
    });

    setMsg("");
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;

    setFormOpen(false);
    setEditingId(null);
    setForm({ ...emptyForm });
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setMsg("Category name is required");
      return;
    }

    setSaving(true);
    setMsg("");

    try {
      if (editingId) {
        const { data } = await updateMasterCategory(editingId, form);
        setMsg(data.message || "Category updated successfully");
      } else {
        const { data } = await createMasterCategory(form);
        setMsg(data.message || "Category created successfully");
      }

      setFormOpen(false);
      setEditingId(null);
      setForm({ ...emptyForm });

      await loadCategories();
    } catch (err: any) {
      setMsg(err?.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const removeCategory = async (category: MasterCategory) => {
    const confirmed = window.confirm(`Delete "${category.name}" category?`);
    if (!confirmed) return;

    setMsg("");

    try {
      const { data } = await deleteMasterCategory(category._id);
      setMsg(data.message || "Category deleted successfully");
      await loadCategories();
    } catch (err: any) {
      setMsg(err?.response?.data?.message || "Failed to delete category");
    }
  };

  const categoryModal =
    formOpen && typeof document !== "undefined"
      ? createPortal(
          <div
            className="masterCategoryModalBackdrop"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !saving) {
                closeForm();
              }
            }}
          >
            <div
              className="masterCategoryModal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="master-category-modal-title"
            >
              <div className="masterCategoryModalHead">
                <div>
                  <span className="eyebrow">MASTER DATA</span>

                  <h2 id="master-category-modal-title">
                    {editingId ? "Edit Category" : "Add Category"}
                  </h2>

                  <p>
                    {editingId
                      ? "Update existing category details."
                      : "Fill the details to create a new category."}
                  </p>
                </div>

                <button
                  type="button"
                  className="masterCategoryModalClose"
                  onClick={closeForm}
                  disabled={saving}
                  aria-label="Close category form"
                >
                  <X size={20} />
                </button>
              </div>

              <form className="masterCategoryModalForm" onSubmit={submit}>
                <label>
                  Category Name

                  <input
                    type="text"
                    placeholder="Example: Home"
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                      })
                    }
                    autoFocus
                    required
                  />
                </label>

                <label>
                  Description

                  <textarea
                    placeholder="Category description"
                    value={form.description}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        description: e.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  Status

                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value as "active" | "inactive",
                      })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>

                <div className="masterCategoryModalActions">
                  <button
                    type="button"
                    className="secondaryAction"
                    onClick={closeForm}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button type="submit" className="primary" disabled={saving}>
                    {saving
                      ? "Saving..."
                      : editingId
                        ? "Update Category"
                        : "Save Category"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div className="masterCategoriesPage">
        <div className="pageHead">
          <div>
            <span className="eyebrow">MASTER DATA</span>
            <h1>Categories</h1>
            <p>Add, edit, view and delete categories.</p>
          </div>

          <div className="masterPageActions">
            <button
              type="button"
              className="secondaryAction"
              onClick={loadCategories}
              disabled={loading}
            >
              <RefreshCw
                size={17}
                className={loading ? "masterRefreshSpin" : ""}
              />
              Refresh
            </button>

            <button type="button" className="primary" onClick={openCreate}>
              <Plus size={17} />
              Add Category
            </button>
          </div>
        </div>

        {msg && <p className="formMessage">{msg}</p>}

        <div className="tableWrap">
          {loading ? (
            <div className="masterEmpty">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="masterEmpty">No categories found.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {categories.map((category) => (
                  <tr key={category._id}>
                    <td>
                      <strong>{category.name}</strong>
                    </td>
                    <td>{category.slug}</td>
                    <td>{category.description || "-"}</td>
                    <td>
                      <span
                        className={`statusBadge ${
                          category.status === "active"
                            ? "statusActive"
                            : "statusInactive"
                        }`}
                      >
                        {category.status}
                      </span>
                    </td>
                    <td>{new Date(category.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="categoryActions">
                        <button
                          type="button"
                          className="editAction"
                          onClick={() => openEdit(category)}
                        >
                          <Edit3 size={16} />
                          Edit
                        </button>

                        <button
                          type="button"
                          className="deleteAction"
                          onClick={() => removeCategory(category)}
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {categoryModal}
    </>
  );
}
