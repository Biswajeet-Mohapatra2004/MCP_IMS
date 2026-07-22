import { useEffect, useState } from "react";
import type { Supplier } from "../../api/suppliers";
import { supplierApi } from "../../api/suppliers";
import { useRole } from "../../hooks/useRole";
import SidePanel from "../../components/SidePanel";
import SupplierForm from "./SupplierForm";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | undefined>(undefined);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { canWrite, canDelete } = useRole();

  const loadData = async () => {
    setLoading(true);
    setSuppliers(await supplierApi.getAll());
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const openCreate = () => { setEditing(undefined); setPanelOpen(true); };
  const openEdit = (s: Supplier) => { setEditing(s); setPanelOpen(true); };

  const handleSubmit = async (data: any) => {
    if (editing) await supplierApi.update(editing.id, data);
    else await supplierApi.create(data);
    setPanelOpen(false);
    await loadData();
  };

  const handleDelete = async (s: Supplier) => {
    setDeleteError(null);
    if (!window.confirm(`Delete supplier "${s.name}"? This cannot be undone.`)) return;
    try {
      await supplierApi.delete(s.id);
      await loadData();
    } catch (err: any) {
      setDeleteError(err?.response?.data?.message ?? "Failed to delete supplier.");
    }
  };

  return (
    <div className="entity-page">
      <div className="entity-page-header">
        <h2 className="panel-title">Suppliers</h2>
        {canWrite && <button className="btn-primary" onClick={openCreate}>+ New Supplier</button>}
      </div>

      {deleteError && <div className="form-error" style={{ marginBottom: 12 }}>{deleteError}</div>}

      {loading ? (
        <div className="loading-state">Loading suppliers…</div>
      ) : suppliers.length === 0 ? (
        <div className="empty-state">No suppliers yet. {canWrite && "Create one to get started."}</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact Email</th>
              <th>Phone</th>
              <th>Products</th>
              {(canWrite || canDelete) && <th style={{ width: 140 }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.contactEmail}</td>
                <td>{s.phone ?? "—"}</td>
                <td>{s.productCount}</td>
                {(canWrite || canDelete) && (
                  <td className="row-actions">
                    {canWrite && <button className="btn-link" onClick={() => openEdit(s)}>Edit</button>}
                    {canDelete && <button className="btn-link btn-link-danger" onClick={() => handleDelete(s)}>Delete</button>}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <SidePanel title={editing ? "Edit Supplier" : "New Supplier"} open={panelOpen} onClose={() => setPanelOpen(false)}>
        <SupplierForm initial={editing} onSubmit={handleSubmit} onCancel={() => setPanelOpen(false)} />
      </SidePanel>
    </div>
  );
}