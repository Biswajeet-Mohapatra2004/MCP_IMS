import { useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useInsightsSummary, useAiNarrative } from "../../hooks/queries/useInsights";

const COLORS = { accent: "#0854A0", warning: "#DF6E0C", success: "#107E3E" };

export default function InsightsPage() {
  const { data: summary, isLoading } = useInsightsSummary();
  const narrative = useAiNarrative();

  useEffect(() => {
    narrative.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading || !summary) {
    return <div className="loading-state">Loading insights…</div>;
  }

  return (
    <div className="entity-page">
      <div className="entity-page-header">
        <h2 className="panel-title">Insights</h2>
        <button className="btn-primary" onClick={() => narrative.mutate()} disabled={narrative.isPending}>
          {narrative.isPending ? "Generating…" : "Refresh AI Summary"}
        </button>
      </div>

      <div className="ai-summary-panel">
        {narrative.isPending ? (
          <div className="chat-typing"><span></span><span></span><span></span></div>
        ) : narrative.isError ? (
          <span className="text-error">Couldn't generate a summary right now.</span>
        ) : (
          <p>{narrative.data}</p>
        )}
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Stock by Category</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={summary.stockByCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D9D9D9" />
              <XAxis dataKey="categoryName" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="totalQuantity" fill={COLORS.accent} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Products per Supplier</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={summary.productsBySupplier}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D9D9D9" />
              <XAxis dataKey="supplierName" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="productCount" fill={COLORS.success} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Warehouse Utilization</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={summary.warehouseUtilization}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D9D9D9" />
              <XAxis dataKey="warehouseName" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="totalQuantity" fill={COLORS.warning} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {summary.lowStockProducts.length > 0 && (
        <div className="panel" style={{ marginTop: 20 }}>
          <h3 className="panel-title">Low Stock Products</h3>
          <table className="data-table">
            <thead>
              <tr><th>SKU</th><th>Name</th><th>Reorder Threshold</th></tr>
            </thead>
            <tbody>
              {summary.lowStockProducts.map((p) => (
                <tr key={p.id}><td>{p.sku}</td><td>{p.name}</td><td>{p.reorderThreshold}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}