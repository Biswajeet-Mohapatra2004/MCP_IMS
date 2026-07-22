import { useEffect, useState } from "react";
import type { Category, CategoryFormData } from "../../api/categories";

interface CategoryFormProps {
  initial?: Category;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  onCancel: () => void;
}

export default function CategoryForm({ initial, onSubmit, onCancel }: CategoryFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(initial?.name ?? "");
    setDescription(initial?.description ?? "");
  }, [initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ name, description: description || undefined });
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
        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Saving..." : initial ? "Save changes" : "Create category"}
        </button>
      </div>
    </form>
  );
}