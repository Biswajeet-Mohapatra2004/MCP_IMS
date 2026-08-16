import { useState } from "react";
import ProductsPage from "./products/ProductsPage";
import CategoriesPage from "./categories/CategoriesPage";
import WarehousesPage from "./warehouses/WarehousesPage";
import StockPage from "./stock/StockPage";
import SuppliersPage from "./suppliers/SuppliersPage";
import InsightsPage from "./insights/InsightsPage";
import ReorderAgentPage from "./reorder/ReorderAgentPage";

type Entity = "products" | "categories" | "warehouses" | "stock" | "suppliers" | "insights" | "reorder";

export default function ConsoleView() {
  const [activeEntity, setActiveEntity] = useState<Entity>("products");

  return (
    <div className="console-view">
      <div className="entity-tabs">
        <button className={activeEntity === "products" ? "active" : ""} onClick={() => setActiveEntity("products")}>Products</button>
        <button className={activeEntity === "categories" ? "active" : ""} onClick={() => setActiveEntity("categories")}>Categories</button>
        <button className={activeEntity === "warehouses" ? "active" : ""} onClick={() => setActiveEntity("warehouses")}>Warehouses</button>
        <button className={activeEntity === "stock" ? "active" : ""} onClick={() => setActiveEntity("stock")}>Stock</button>
        <button className={activeEntity === "suppliers" ? "active" : ""} onClick={() => setActiveEntity("suppliers")}>Suppliers</button>
        <button className={activeEntity === "insights" ? "active" : ""} onClick={() => setActiveEntity("insights")}>Insights</button>
        <button className={activeEntity === "reorder" ? "active" : ""} onClick={() => setActiveEntity("reorder")}>Reorder Agent</button>
      </div>

      <div className="entity-content">
        {activeEntity === "products" && <ProductsPage />}
        {activeEntity === "categories" && <CategoriesPage />}
        {activeEntity === "warehouses" && <WarehousesPage />}
        {activeEntity === "stock" && <StockPage />}
        {activeEntity === "suppliers" && <SuppliersPage />}
        {activeEntity === "insights" && <InsightsPage />}
        {activeEntity === "reorder" && <ReorderAgentPage />}
      </div>
    </div>
  );
}