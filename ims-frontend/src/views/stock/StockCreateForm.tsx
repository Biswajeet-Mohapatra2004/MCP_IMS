import { useState } from "react";
import type { Product } from "../../api/products";
import type { Warehouse } from "../../api/warehouses";
import type { StockCreateData } from "../../api/stock";

interface StockCreateFormProps {
  products: Product[];
  warehouses: Warehouse[];
  onSubmit: (data: StockCreateData) => Promise<void>;
  onCancel: () => void;
}

export default function StockCreateForm({ products, warehouses, onSubmit, onCancel }: StockCreateFormProps) {
  const [productId, setProductId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        productId: parseInt(productId),
        warehouseId: parseInt(warehouseId),
        quantity: quantity ? parseInt(quantity) : 0,
      });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="entity-form" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}

      <div className="form-field">
        <label>Product</label>
        <select value={productId} onChange={(e) => setProductId(e.target.value)} required>
          <option value="">— Select product —</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label>Warehouse</label>
        <select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)} required>
          <option value="">— Select warehouse —</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label>Initial Quantity</label>
        <input type="number" min="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Creating..." : "Create stock record"}
        </button>
      </div>
    </form>
  );
}