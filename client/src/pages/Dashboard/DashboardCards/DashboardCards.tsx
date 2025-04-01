import { FaCalendarAlt, FaBookOpen } from "react-icons/fa";
import "./DashboardCards.css";

function DashboardCards() {
  return (
    <div className="dashboard-cards">
      <div className="dashboard-card" onClick={() => alert("Zum Wochenplaner!")}>
        <FaCalendarAlt className="dashboard-icon" size={45} />
        <h3>Wochenplaner</h3>
        <p>Plane deine Mahlzeiten für die ganze Woche</p>
      </div>
      <div className="dashboard-card" onClick={() => alert("Zum Rezeptbuch!")}>
        <FaBookOpen className="dashboard-icon" size={45} />
        <h3>Mein Rezeptbuch</h3>
        <p>Deine gespeicherten und geliketen Rezepte</p>
      </div>
    </div>
  );
}

export default DashboardCards;
