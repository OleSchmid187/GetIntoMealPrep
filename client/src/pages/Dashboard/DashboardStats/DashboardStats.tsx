import { ProgressBar } from 'primereact/progressbar';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import "./DashboardStats.css";

function DashboardStats() {
  return (
    <div className="dashboard-stats">
      <h3>Deine Woche im Überblick</h3>

      <div className="stat-item">
        <span>Ø Meal-Preis:</span>
        <strong>2,90 €</strong>
      </div>

      <div className="stat-item">
        <span>Vorbereitete Gerichte:</span>
        <div className="progress-bar-container">
          <ProgressBar value={70} showValue={false} />
          <span className="progress-bar-text">7 / 10</span>
        </div>
      </div>

      <div className="stat-item">
        <span>Nährwert-Ziel (Kalorien pro Tag):</span>
        <div className="progress-bar-container">
          <ProgressBar value={85} showValue={false} />
          <span className="progress-bar-text">1700 kcal</span>
        </div>
      </div>
    </div>
  );
}

export default DashboardStats;
