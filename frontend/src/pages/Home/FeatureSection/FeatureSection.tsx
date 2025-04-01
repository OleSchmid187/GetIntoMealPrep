import feature1 from "../../../assets/feature1.png";
import feature2 from "../../../assets/feature2.png";
import feature3 from "../../../assets/feature3.png";

import "./FeatureSection.css";

function FeaturesSection() {
  return (
    <section className="home-features-section">
      <h2>So funktioniert’s</h2>
      <div className="home-features-grid">
        <div className="home-feature">
          <img src={feature1} alt="Wochenplan erstellen" />
          <h3>Wochenplan erstellen</h3>
          <p>Plane deine Mahlzeiten mit nur wenigen Klicks.</p>
        </div>
        <div className="home-feature">
          <img src={feature2} alt="Automatische Einkaufsliste" />
          <h3>Automatische Einkaufsliste</h3>
          <p>Alle Zutaten gesammelt – direkt aufs Handy.</p>
        </div>
        <div className="home-feature">
          <img src={feature3} alt="Nährwert im Blick" />
          <h3>Nährwert im Blick</h3>
          <p>Erkenne sofort, was du deinem Körper gibst.</p>
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
