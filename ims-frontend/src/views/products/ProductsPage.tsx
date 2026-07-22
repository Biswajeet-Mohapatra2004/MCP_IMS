import { useState } from "react";
import type { Product } from "../../api/products";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "../../hooks/queries/useProducts";
import { useCategories } from "../../hooks/queries/useCategories";
import { useSuppliers } from "../../hooks/queries/useSuppliers";
import { useRole } from "../../hooks/useRole";
import SidePanel from "../../components/SidePanel";
import ProductForm from "./ProductForm";

export default function ProductsPage() {
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: suppliers = [] } = useSuppliers();

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [panelOpen, setPanelOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { canWrite, canDelete } = useRole();

  const openCreate = () => { setEditingProduct(undefined); setPanelOpen(true); };
  const openEdit = (product: Product) => { setEditingProduct(product); setPanelOpen(true); };

  const handleSubmit = async (data: any) => {
    if (editingProduct) {
      await updateProduct.mutateAsync({ id: editingProduct.id, data });
    } else {
      await createProduct.mutateAsync(data);
    }
    setPanelOpen(false);
  };

  const handleDelete = async (product: Product) => {
    setDeleteError(null);
    if (!window.confirm(`Delete product "${product.name}"? This cannot be undone.`)) return;
    try {
      await deleteProduct.mutateAsync(product.id);
    } catch (err: any) {
      setDeleteError(err?.response?.data?.message ?? "Failed to delete product.");
    }
  };

  return (
    <div className="entity-page">
      <div className="entity-page-header">
        <h2 className="panel-title">Products</h2>
        {canWrite && <button className="btn-primary" onClick={openCreate}>+ New Product</button>}
      </div>

      {deleteError && <div className="form-error" style={{ marginBottom: 12 }}>{deleteError}</div>}

      {isLoading ? (
        <div className="loading-state">Loading products…</div>
      ) : products.length === 0 ? (
        <div className="empty-state">No products yet. {canWrite && "Create one to get started."}</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Category</th>
              <th>Unit Price</th>
              <th>Reorder Threshold</th>
              {(canWrite || canDelete) && <th style={{ width: 140 }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.sku}</td>
                <td>{p.name}</td>
                <td>{p.categoryName ?? "—"}</td>
                <td>₹{p.unitPrice.toFixed(2)}</td>
                <td>{p.reorderThreshold}</td>
                {(canWrite || canDelete) && (
                  <td className="row-actions">
                    {canWrite && <button className="btn-link" onClick={() => openEdit(p)}>Edit</button>}
                    {canDelete && <button className="btn-link btn-link-danger" onClick={() => handleDelete(p)}>Delete</button>}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <SidePanel
        title={editingProduct ? "Edit Product" : "New Product"}
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
      >
        <ProductForm
          initial={editingProduct}
          categories={categories}
          suppliers={suppliers}
          onSubmit={handleSubmit}
          onCancel={() => setPanelOpen(false)}
        />
      </SidePanel>
    </div>
  );
}