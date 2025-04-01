import { useNavigate } from "react-router-dom";
import Button from "../../../components/Button/Button";
import "./CTASection.css";

function CTASection() {
  const navigate = useNavigate();
  return (
    <section className="home-cta-section">
      <h2>Starte jetzt mit Meal Prep</h2>
      <p>Einfach, gesund und organisiert – alles an einem Ort.</p>
      <Button
        size="large"
        color="primary"
        className="header-start-button"
        onClick={() => {
          navigate("/dashboard");
        }}
        
      >
        Jetzt starten
      </Button>
    </section>
  );
}

export default CTASection;