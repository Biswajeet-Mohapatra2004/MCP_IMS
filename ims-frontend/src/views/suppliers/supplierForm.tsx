import { useEffect, useState } from "react";
import type { Supplier, SupplierFormData } from "../../api/suppliers";

interface SupplierFormProps {
  initial?: Supplier;
  onSubmit: (data: SupplierFormData) => Promise<void>;
  onCancel: () => void;
}

export default function SupplierForm({ initial, onSubmit, onCancel }: SupplierFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [contactEmail, setContactEmail] = useState(initial?.contactEmail ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(initial?.name ?? "");
    setContactEmail(initial?.contactEmail ?? "");
    setPhone(initial?.phone ?? "");
  }, [initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ name, contactEmail, phone: phone || undefined });
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
        <label>Contact Email</label>
        <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required />
      </div>

      <div className="form-field">
        <label>Phone</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Saving..." : initial ? "Save changes" : "Create supplier"}
        </button>
      </div>
    </form>
  );
}