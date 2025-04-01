import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/variables.css";
import Button from "../Button/Button";
import "./Header.css";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
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
        GetIntoMealPrep
      </div>

      {isHome && (
        <Button
          size="medium"
          color="primary"
          className="header-start-button"
          onClick={() => {
            navigate("/dashboard");
          }}
        >
          Jetzt starten
        </Button>
      )}
    </header>
  );
}


export default Header;