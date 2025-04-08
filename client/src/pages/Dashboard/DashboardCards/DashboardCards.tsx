import { FaCalendarAlt, FaBookOpen } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./DashboardCards.css";

function DashboardCards() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-cards">
      <div className="dashboard-card" onClick={() => navigate("/planner")}>
        <FaCalendarAlt className="dashboard-icon" size={45} />
        <h3>Wochenplaner</h3>
        <p>Plane deine Mahlzeiten für die ganze Woche</p>
      </div>
      <div className="dashboard-card" onClick={() => navigate("/my-recipes")}>
        <FaBookOpen className="dashboard-icon" size={45} />
        <h3>Mein Rezeptbuch</h3>
        <p>Deine gespeicherten und geliketen Rezepte</p>
      </div>
    </div>
  );
}

export default DashboardCards;
