import DashboardPanel from "./DashboardPanel/DashboardPanel";
import RecipeSuggestions from "./RecipeSuggestions/RecipeSuggestions";
import { useProfileData } from "../../utils/useProfileData";
import "./Dashboard.css";

function Dashboard() {
  const { profileData, loading, error } = useProfileData();

  if (loading) {
    return <div className="dashboard-loading">Lade Benutzerdaten...</div>;
  }

  if (error || !profileData) {
    return <div className="dashboard-error">Fehler beim Laden der Benutzerdaten</div>;
  }

  const { username } = profileData;

  return (
    <div className="dashboard-wrapper">
      <h2 className="dashboard-greeting">Hallo, {username} 👋</h2>
      <DashboardPanel />
      <RecipeSuggestions />
    </div>
  );
}

export default Dashboard;
