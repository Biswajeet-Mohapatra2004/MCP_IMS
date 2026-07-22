import { useState } from "react";
import type { Category } from "../../api/categories";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "../../hooks/queries/useCategories";
import { useRole } from "../../hooks/useRole";
import SidePanel from "../../components/SidePanel";
import CategoryForm from "./CategoryForm";

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<Category | undefined>(undefined);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { canWrite, canDelete } = useRole();

  const openCreate = () => { setEditing(undefined); setPanelOpen(true); };
  const openEdit = (c: Category) => { setEditing(c); setPanelOpen(true); };

  const handleSubmit = async (data: any) => {
    if (editing) await updateCategory.mutateAsync({ id: editing.id, data });
    else await createCategory.mutateAsync(data);
    setPanelOpen(false);
  };

  const handleDelete = async (c: Category) => {
    setDeleteError(null);
    if (!window.confirm(`Delete category "${c.name}"? This cannot be undone.`)) return;
    try {
      await deleteCategory.mutateAsync(c.id);
    } catch (err: any) {
      setDeleteError(err?.response?.data?.message ?? "Failed to delete category.");
    }
  };

  return (
    <div className="entity-page">
      <div className="entity-page-header">
        <h2 className="panel-title">Categories</h2>
        {canWrite && <button className="btn-primary" onClick={openCreate}>+ New Category</button>}
      </div>

      {deleteError && <div className="form-error" style={{ marginBottom: 12 }}>{deleteError}</div>}

      {isLoading ? (
        <div className="loading-state">Loading categories…</div>
      ) : categories.length === 0 ? (
        <div className="empty-state">No categories yet. {canWrite && "Create one to get started."}</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Products</th>
              {(canWrite || canDelete) && <th style={{ width: 140 }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.description ?? "—"}</td>
                <td>{c.productCount}</td>
                {(canWrite || canDelete) && (
                  <td className="row-actions">
                    {canWrite && <button className="btn-link" onClick={() => openEdit(c)}>Edit</button>}
                    {canDelete && <button className="btn-link btn-link-danger" onClick={() => handleDelete(c)}>Delete</button>}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <SidePanel title={editing ? "Edit Category" : "New Category"} open={panelOpen} onClose={() => setPanelOpen(false)}>
        <CategoryForm initial={editing} onSubmit={handleSubmit} onCancel={() => setPanelOpen(false)} />
      </SidePanel>
    </div>
  );
}