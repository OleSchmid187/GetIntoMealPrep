import feature1 from "../../../assets/feature1.jpg";
import feature2 from "../../../assets/feature2.jpg";
import feature3 from "../../../assets/feature3.jpg";

import "./FeatureSection.css";

function FeaturesSection() {
  const headingId = "features-section-heading"; // Unique ID for the heading
  return (
    <section className="home-features-section" aria-labelledby={headingId}>
      <h2 id={headingId}>So funktioniert’s</h2>
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
