import { useState } from "react";
import type { StockItem } from "../../api/stock";
import { useStockItems, useCreateStockItem, useAdjustStock, useDeleteStockItem } from "../../hooks/queries/useStock";
import { useProducts } from "../../hooks/queries/useProducts";
import { useWarehouses } from "../../hooks/queries/useWarehouses";
import { useRole } from "../../hooks/useRole";
import SidePanel from "../../components/SidePanel";
import StockCreateForm from "./StockCreateForm";
import StockAdjustForm from "./StockAdjustForm";

export default function StockPage() {
  const { data: stockItems = [], isLoading } = useStockItems();
  const { data: products = [] } = useProducts();
  const { data: warehouses = [] } = useWarehouses();

  const createStockItem = useCreateStockItem();
  const adjustStock = useAdjustStock();
  const deleteStockItem = useDeleteStockItem();

  const [createPanelOpen, setCreatePanelOpen] = useState(false);
  const [adjustingItem, setAdjustingItem] = useState<StockItem | undefined>(undefined);
  const [actionError, setActionError] = useState<string | null>(null);
  const { canWrite, canDelete } = useRole();

  const handleCreate = async (data: any) => {
    await createStockItem.mutateAsync(data);
    setCreatePanelOpen(false);
  };

  const handleAdjust = async (quantityChange: number) => {
    if (!adjustingItem) return;
    await adjustStock.mutateAsync({
      productId: adjustingItem.productId,
      warehouseId: adjustingItem.warehouseId,
      quantityChange,
    });
    setAdjustingItem(undefined);
  };

  const handleDelete = async (item: StockItem) => {
    setActionError(null);
    if (!window.confirm(`Delete stock record for "${item.productName}" at "${item.warehouseName}"? This removes tracking entirely.`)) return;
    try {
      await deleteStockItem.mutateAsync(item.id);
    } catch (err: any) {
      setActionError(err?.response?.data?.message ?? "Failed to delete stock record.");
    }
  };

  return (
    <div className="entity-page">
      <div className="entity-page-header">
        <h2 className="panel-title">Stock</h2>
        {canWrite && <button className="btn-primary" onClick={() => setCreatePanelOpen(true)}>+ New Stock Record</button>}
      </div>

      {actionError && <div className="form-error" style={{ marginBottom: 12 }}>{actionError}</div>}

      {isLoading ? (
        <div className="loading-state">Loading stock…</div>
      ) : stockItems.length === 0 ? (
        <div className="empty-state">No stock records yet. {canWrite && "Create one to get started."}</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Warehouse</th>
              <th>Quantity</th>
              <th>Last Updated</th>
              {(canWrite || canDelete) && <th style={{ width: 160 }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {stockItems.map((item) => (
              <tr key={item.id}>
                <td>{item.productName} ({item.productSku})</td>
                <td>{item.warehouseName}</td>
                <td>{item.quantity}</td>
                <td>{new Date(item.lastUpdated).toLocaleString()}</td>
                {(canWrite || canDelete) && (
                  <td className="row-actions">
                    {canWrite && <button className="btn-link" onClick={() => setAdjustingItem(item)}>Adjust</button>}
                    {canDelete && <button className="btn-link btn-link-danger" onClick={() => handleDelete(item)}>Delete</button>}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <SidePanel title="New Stock Record" open={createPanelOpen} onClose={() => setCreatePanelOpen(false)}>
        <StockCreateForm
          products={products}
          warehouses={warehouses}
          onSubmit={handleCreate}
          onCancel={() => setCreatePanelOpen(false)}
        />
      </SidePanel>

      <SidePanel title="Adjust Stock" open={!!adjustingItem} onClose={() => setAdjustingItem(undefined)}>
        {adjustingItem && (
          <StockAdjustForm
            item={adjustingItem}
            onSubmit={handleAdjust}
            onCancel={() => setAdjustingItem(undefined)}
          />
        )}
      </SidePanel>
    </div>
  );
}