import DashboardCards from "../DashboardCards/DashboardCards";
import DashboardStats from "../DashboardStats/DashboardStats";
import "./DashboardPanel.css";

function DashboardPanel() {
  return (
    <div className="dashboard-panel" data-testid="dashboard-panel-container">
      <DashboardCards />
      <DashboardStats />
    </div>
  );
}

export default DashboardPanel;
