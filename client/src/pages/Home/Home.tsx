import "../../styles/variables.css";
import "./Home.css";

import HeroSection from "./HeroSection/HeroSection";
import FeaturesSection from "./FeatureSection/FeatureSection";
import CTASection from "./CTASection/CTASection";

function Home() {
  
  return (
    <>
      <div className="home-container" data-testid="home-container">
        <HeroSection />
        <FeaturesSection />
        <CTASection />
      </div>
    </>
  );
}

export default Home;
