import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/variables.css";
import Button from "../Button/Button";
import "./Header.css";
import { useLogto } from "@logto/react"; // Import Logto hook
import logtoConfig from "../../config/logtoConfig"; // Import Logto configuration
import { FaUserCircle } from "react-icons/fa"; // Import profile icon
import logo from "../../assets/getintomealpreplogo.png"; // Import the logo image

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, signIn } = useLogto(); // Use Logto hook
  const isHome = location.pathname === "/";

  return (
    <header className="header">
      <div
        className="header-logo"
        onClick={() => {
          navigate("/");
        }}
        style={{ cursor: "pointer" }}
      >
        <img src={logo} alt="GetIntoMealPrep Logo" className="header-logo-image" />
      </div>

      {isAuthenticated ? (
        <div className="header-actions">
          {!isHome && (
            <FaUserCircle
              className="profile-icon"
              onClick={() => navigate("/profil")}
            />
          )}
          {isHome && (
            <>
              <FaUserCircle
                className="profile-icon"
                onClick={() => navigate("/profil")}
              />
              <Button
                size="medium"
                color="primary"
                className="header-dashboard-button"
                onClick={() => navigate("/dashboard")}
              >
                Zum Dashboard
              </Button>
            </>
          )}
        </div>
      ) : (
        isHome && (
          <Button
            size="medium"
            color="primary"
            className="header-start-button"
            onClick={async () => {
              console.log(isAuthenticated);
              await signIn(logtoConfig.redirectUri);
            }}
          >
            Jetzt starten
          </Button>
        )
      )}
    </header>
  );
}

export default Header;