import { useNavigate } from "react-router-dom";
import Button from "../../../components/Button/Button";
import { useLogto } from "@logto/react";
import logtoConfig from "../../../config/logtoConfig";
import "./CTASection.css";

function CTASection() {
  const navigate = useNavigate();
  const { isAuthenticated, signIn } = useLogto();

  return (
    <section className="home-cta-section">
      <h2>Starte jetzt mit Meal Prep</h2>
      <p>Einfach, gesund und organisiert – alles an einem Ort.</p>
      <Button
        size="large"
        color="primary"
        className="header-start-button"
        onClick={async () => {
          if (isAuthenticated) {
            navigate("/dashboard");
          } else {
            await signIn(logtoConfig.redirectUri);
          }
        }}
      >
        Jetzt starten
      </Button>
    </section>
  );
}

export default CTASection;