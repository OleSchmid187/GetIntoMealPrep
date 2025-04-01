import "./DashboardPanel.css";

function DashboardPanel() {
  return (
    <div className="dashboard-panel">
      <h3>Dein Dashboard</h3>
      <div className="dashboard-actions">
        <button>Einstellungen</button>
        <button>Monatsplan anzeigen</button>
        <button>⌀ Einkauf pro Woche</button>
        <button>⌀ Preis pro Mahlzeit</button>
      </div>
    </div>
  );
}

export default DashboardPanel;
