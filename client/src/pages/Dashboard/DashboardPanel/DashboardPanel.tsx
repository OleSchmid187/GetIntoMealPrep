import DashboardCards from "../DashboardCards/DashboardCards";
import DashboardStats from "../DashboardStats/DashboardStats";
import "./DashboardPanel.css";

function DashboardPanel() {
  return (
    <div className="dashboard-panel">
      <DashboardCards />
      <DashboardStats />
    </div>
  );
}

export default DashboardPanel;
