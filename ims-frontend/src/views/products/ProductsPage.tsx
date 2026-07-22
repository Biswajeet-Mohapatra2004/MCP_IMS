import { useEffect, useState } from "react";
import type { Product } from "../../api/products";
import { productApi } from "../../api/products";
import type { Category } from "../../api/categories";
import { categoryApi } from "../../api/categories";
import type { Supplier } from "../../api/suppliers";
import { supplierApi } from "../../api/suppliers";
import { useRole } from "../../hooks/useRole";
import SidePanel from "../../components/SidePanel";
import ProductForm from "./ProductForm";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);   // <-- must exist, defaulted to []
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { canWrite, canDelete } = useRole();

  const loadData = async () => {
    setLoading(true);
    const [productsData, categoriesData, suppliersData] = await Promise.all([
      productApi.getAll(),
      categoryApi.getAll(),
      supplierApi.getAll(),          // <-- must be fetched
    ]);
    setProducts(productsData);
    setCategories(categoriesData);
    setSuppliers(suppliersData);      // <-- must be set
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditingProduct(undefined);
    setPanelOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setPanelOpen(true);
  };

  const handleSubmit = async (data: any) => {
    if (editingProduct) {
      await productApi.update(editingProduct.id, data);
    } else {
      await productApi.create(data);
    }
    setPanelOpen(false);
    await loadData();
  };

  const handleDelete = async (product: Product) => {
    setDeleteError(null);
    if (!window.confirm(`Delete product "${product.name}"? This cannot be undone.`)) return;
    try {
      await productApi.delete(product.id);
      await loadData();
    } catch (err: any) {
      setDeleteError(err?.response?.data?.message ?? "Failed to delete product.");
    }
  };

  return (
    <div className="entity-page">
      <div className="entity-page-header">
        <h2 className="panel-title">Products</h2>
        {canWrite && (
          <button className="btn-primary" onClick={openCreate}>+ New Product</button>
        )}
      </div>

      {deleteError && <div className="form-error" style={{ marginBottom: 12 }}>{deleteError}</div>}

      {loading ? (
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