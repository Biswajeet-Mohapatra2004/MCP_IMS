import { useState } from "react";
import type { ReorderSuggestion, ExecutionResult } from "../../api/reorder";
import { useGenerateReorderPlan, useExecuteReorderPlan } from "../../hooks/queries/useReorder";
import { useRole } from "../../hooks/useRole";

export default function ReorderAgentPage() {
  const generatePlan = useGenerateReorderPlan();
  const executePlan = useExecuteReorderPlan();
  const { canWrite } = useRole();

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [results, setResults] = useState<ExecutionResult[] | null>(null);

  const plan = generatePlan.data ?? [];

  const handleGenerate = () => {
    setResults(null);
    setSelectedIds(new Set());
    generatePlan.mutate();
  };

  const toggleSelected = (productId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const toggleAll = () => {
    const executable = plan.filter((p) => p.warehouseId !== null);
    if (selectedIds.size === executable.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(executable.map((p) => p.productId)));
    }
  };

  const handleExecute = async () => {
    const approved = plan.filter((p) => selectedIds.has(p.productId));
    const res = await executePlan.mutateAsync(approved);
    setResults(res);
  };

  const executableCount = plan.filter((p) => p.warehouseId !== null).length;

  return (
    <div className="entity-page">
      <div className="entity-page-header">
        <h2 className="panel-title">Reorder Agent</h2>
        {canWrite && (
          <button className="btn-primary" onClick={handleGenerate} disabled={generatePlan.isPending}>
            {generatePlan.isPending ? "Analyzing…" : "Generate Reorder Plan"}
          </button>
        )}
      </div>

      {!canWrite && (
        <div className="empty-state">You don't have permission to generate or execute reorder plans.</div>
      )}

      {generatePlan.isPending && (
        <div className="ai-summary-panel">
          <div className="chat-typing"><span></span><span></span><span></span></div>
          <span style={{ marginLeft: 8 }}>Reviewing low-stock products and drafting suggestions…</span>
        </div>
      )}

      {generatePlan.isError && (
        <div className="form-error">Couldn't generate a plan right now. Please try again.</div>
      )}

      {!generatePlan.isPending && plan.length === 0 && generatePlan.isSuccess && (
        <div className="empty-state">Nothing needs reordering right now — all stock is above threshold.</div>
      )}

      {plan.length > 0 && (
        <>
          <div className="reorder-toolbar">
            <label className="reorder-select-all">
              <input
                type="checkbox"
                checked={executableCount > 0 && selectedIds.size === executableCount}
                onChange={toggleAll}
              />
              Select all executable ({executableCount})
            </label>
            <button
              className="btn-primary"
              onClick={handleExecute}
              disabled={selectedIds.size === 0 || executePlan.isPending}
            >
              {executePlan.isPending ? "Executing…" : `Approve & Execute (${selectedIds.size})`}
            </button>
          </div>

          <div className="reorder-list">
            {plan.map((item) => (
              <ReorderCard
                key={item.productId}
                item={item}
                checked={selectedIds.has(item.productId)}
                onToggle={() => toggleSelected(item.productId)}
                result={results?.find((r) => r.productName === item.productName)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ReorderCard({
  item,
  checked,
  onToggle,
  result,
}: {
  item: ReorderSuggestion;
  checked: boolean;
  onToggle: () => void;
  result?: ExecutionResult;
}) {
  const executable = item.warehouseId !== null;

  return (
    <div className={`reorder-card ${result ? `reorder-card-${result.status}` : ""}`}>
      <div className="reorder-card-checkbox">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          disabled={!executable || !!result}
        />
      </div>

      <div className="reorder-card-body">
        <div className="reorder-card-header">
          <strong>{item.productName}</strong>
          <span className="text-secondary"> ({item.sku})</span>
        </div>

        <div className="reorder-card-meta">
          <span>Current: <strong>{item.currentQuantity}</strong></span>
          <span>Threshold: <strong>{item.reorderThreshold}</strong></span>
          <span>Suggested reorder: <strong>+{item.suggestedQuantity}</strong></span>
        </div>

        <div className="reorder-card-meta">
          <span>Supplier: {item.supplierName ?? <span className="text-error">None linked</span>}</span>
          <span>Warehouse: {item.warehouseName ?? <span className="text-error">No stock record</span>}</span>
        </div>

        <p className="reorder-card-reasoning">{item.reasoning}</p>

        {result && (
          <div className={`reorder-card-status reorder-card-status-${result.status}`}>
            {result.status === "executed" ? `✓ ${result.result}` : `⚠ Skipped — ${result.reason}`}
          </div>
        )}
      </div>
    </div>
  );
}