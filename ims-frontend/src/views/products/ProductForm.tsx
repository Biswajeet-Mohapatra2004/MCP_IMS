import { useEffect, useState } from "react";
import { type Product, type ProductFormData } from "../../api/products";
import type { Category } from "../../api/categories.ts";
import type { Supplier } from "../../api/suppliers";

interface ProductFormProps {
  initial?: Product;
  categories: Category[];
  suppliers: Supplier[];
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
}

export default function ProductForm({ initial, categories, suppliers , onSubmit, onCancel }: ProductFormProps) {
  const [sku, setSku] = useState(initial?.sku ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [unitPrice, setUnitPrice] = useState(initial?.unitPrice?.toString() ?? "");
  const [reorderThreshold, setReorderThreshold] = useState(initial?.reorderThreshold?.toString() ?? "10");
  const [categoryId, setCategoryId] = useState(initial?.categoryId?.toString() ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supplierIds, setSupplierIds] = useState<number[]>(
    initial?.suppliers?.map((s) => s.id) ?? []
  );
  const isEdit = !!initial;

  useEffect(() => {
    setSku(initial?.sku ?? "");
    setName(initial?.name ?? "");
    setDescription(initial?.description ?? "");
    setUnitPrice(initial?.unitPrice?.toString() ?? "");
    setReorderThreshold(initial?.reorderThreshold?.toString() ?? "10");
    setCategoryId(initial?.categoryId?.toString() ?? "");
    setSupplierIds(initial?.suppliers?.map((s) => s.id) ?? []);
  }, [initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const payload: ProductFormData = {
        name,
        description: description || undefined,
        unitPrice: parseFloat(unitPrice),
        reorderThreshold: reorderThreshold ? parseInt(reorderThreshold) : undefined,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        supplierIds
      };
      if (!isEdit) payload.sku = sku;
      await onSubmit(payload);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="entity-form" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}

      {!isEdit && (
        <div className="form-field">
          <label>SKU</label>
          <input value={sku} onChange={(e) => setSku(e.target.value)} required />
        </div>
      )}

      <div className="form-field">
        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className="form-field">
        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      </div>

      <div className="form-field">
        <label>Unit Price</label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          value={unitPrice}
          onChange={(e) => setUnitPrice(e.target.value)}
          required
        />
      </div>

      <div className="form-field">
        <label>Reorder Threshold</label>
        <input
          type="number"
          min="0"
          value={reorderThreshold}
          onChange={(e) => setReorderThreshold(e.target.value)}
        />
      </div>

      <div className="form-field">
        <label>Category</label>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">— None —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label>Suppliers</label>
        <select
          multiple
          value={supplierIds.map(String)}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions).map((o) => parseInt(o.value));
            setSupplierIds(selected);
          }}
          className="multi-select"
        >
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <span className="field-hint">Hold Ctrl/Cmd to select multiple</span>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Saving..." : isEdit ? "Save changes" : "Create product"}
        </button>
      </div>
    </form>
  );
}