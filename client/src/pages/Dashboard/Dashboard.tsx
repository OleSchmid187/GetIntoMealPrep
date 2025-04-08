import DashboardPanel from "./DashboardPanel/DashboardPanel";
import RecipeSuggestions from "./RecipeSuggestions/RecipeSuggestions";
import "./Dashboard.css";

function Dashboard() {
    const username = "Ole"; // später dynamisch
    
    return (
      <>
        <div className="dashboard-wrapper">
          <h2 className="dashboard-greeting">Hallo, {username} 👋</h2>
          <DashboardPanel />
          <RecipeSuggestions />
        </div>
      </>
    );
  }
  
  export default Dashboard;