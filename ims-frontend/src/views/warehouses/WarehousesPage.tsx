import { useState } from "react";
import type { Warehouse } from "../../api/warehouses";
import { useWarehouses, useCreateWarehouse, useUpdateWarehouse, useDeleteWarehouse } from "../../hooks/queries/useWarehouses";
import { useRole } from "../../hooks/useRole";
import SidePanel from "../../components/SidePanel";
import WarehouseForm from "./WarehouseForm";

export default function WarehousesPage() {
  const { data: warehouses = [], isLoading } = useWarehouses();
  const createWarehouse = useCreateWarehouse();
  const updateWarehouse = useUpdateWarehouse();
  const deleteWarehouse = useDeleteWarehouse();

  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<Warehouse | undefined>(undefined);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { canWrite, canDelete } = useRole();

  const openCreate = () => { setEditing(undefined); setPanelOpen(true); };
  const openEdit = (w: Warehouse) => { setEditing(w); setPanelOpen(true); };

  const handleSubmit = async (data: any) => {
    if (editing) await updateWarehouse.mutateAsync({ id: editing.id, data });
    else await createWarehouse.mutateAsync(data);
    setPanelOpen(false);
  };

  const handleDelete = async (w: Warehouse) => {
    setDeleteError(null);
    if (!window.confirm(`Delete warehouse "${w.name}"? This cannot be undone.`)) return;
    try {
      await deleteWarehouse.mutateAsync(w.id);
    } catch (err: any) {
      setDeleteError(err?.response?.data?.message ?? "Failed to delete warehouse.");
    }
  };

  return (
    <div className="entity-page">
      <div className="entity-page-header">
        <h2 className="panel-title">Warehouses</h2>
        {canWrite && <button className="btn-primary" onClick={openCreate}>+ New Warehouse</button>}
      </div>

      {deleteError && <div className="form-error" style={{ marginBottom: 12 }}>{deleteError}</div>}

      {isLoading ? (
        <div className="loading-state">Loading warehouses…</div>
      ) : warehouses.length === 0 ? (
        <div className="empty-state">No warehouses yet. {canWrite && "Create one to get started."}</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Stock Items</th>
              {(canWrite || canDelete) && <th style={{ width: 140 }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {warehouses.map((w) => (
              <tr key={w.id}>
                <td>{w.name}</td>
                <td>{w.location}</td>
                <td>{w.stockItemCount}</td>
                {(canWrite || canDelete) && (
                  <td className="row-actions">
                    {canWrite && <button className="btn-link" onClick={() => openEdit(w)}>Edit</button>}
                    {canDelete && <button className="btn-link btn-link-danger" onClick={() => handleDelete(w)}>Delete</button>}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <SidePanel title={editing ? "Edit Warehouse" : "New Warehouse"} open={panelOpen} onClose={() => setPanelOpen(false)}>
        <WarehouseForm initial={editing} onSubmit={handleSubmit} onCancel={() => setPanelOpen(false)} />
      </SidePanel>
    </div>
  );
}