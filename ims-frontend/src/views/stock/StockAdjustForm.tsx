import { useState } from "react";
import type { StockItem } from "../../api/stock";

interface StockAdjustFormProps {
  item: StockItem;
  onSubmit: (quantityChange: number) => Promise<void>;
  onCancel: () => void;
}

export default function StockAdjustForm({ item, onSubmit, onCancel }: StockAdjustFormProps) {
  const [quantityChange, setQuantityChange] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsedChange = parseInt(quantityChange || "0");
  const resultingQty = item.quantity + (isNaN(parsedChange) ? 0 : parsedChange);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(parsedChange);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="entity-form" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}

      <div className="stock-adjust-summary">
        <div><strong>{item.productName}</strong> ({item.productSku})</div>
        <div className="text-secondary">{item.warehouseName}</div>
        <div className="text-secondary">Current quantity: <strong>{item.quantity}</strong></div>
      </div>

      <div className="form-field">
        <label>Quantity Change (positive to add, negative to remove)</label>
        <input
          type="number"
          value={quantityChange}
          onChange={(e) => setQuantityChange(e.target.value)}
          placeholder="e.g. 50 or -20"
          required
        />
      </div>

      <div className="text-secondary" style={{ fontSize: 12 }}>
        Resulting quantity: <strong>{resultingQty}</strong>
        {resultingQty < 0 && <span className="text-error"> — invalid, cannot go below zero</span>}
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={submitting || resultingQty < 0 || !quantityChange}>
          {submitting ? "Adjusting..." : "Apply adjustment"}
        </button>
      </div>
    </form>
  );
}