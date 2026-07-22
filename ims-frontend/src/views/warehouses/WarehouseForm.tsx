import { useEffect, useState } from "react";
import type { Warehouse, WarehouseFormData } from "../../api/warehouses";

interface WarehouseFormProps {
  initial?: Warehouse;
  onSubmit: (data: WarehouseFormData) => Promise<void>;
  onCancel: () => void;
}

export default function WarehouseForm({ initial, onSubmit, onCancel }: WarehouseFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(initial?.name ?? "");
    setLocation(initial?.location ?? "");
  }, [initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ name, location });
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
        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className="form-field">
        <label>Location</label>
        <input value={location} onChange={(e) => setLocation(e.target.value)} required />
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Saving..." : initial ? "Save changes" : "Create warehouse"}
        </button>
      </div>
    </form>
  );
}