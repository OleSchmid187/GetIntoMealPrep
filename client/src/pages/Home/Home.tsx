import "../../styles/variables.css";
import "./Home.css";

import Header from "../../components/Header/Header";
import HeroSection from "./HeroSection/HeroSection";
import FeaturesSection from "./FeatureSection/FeatureSection";
import CTASection from "./CTASection/CTASection";

function Home() {
  
  return (
    <>
      <Header />
      <div className="home-container">
        <HeroSection />
        <FeaturesSection />
        <CTASection />
      </div>
    </>
  );
}

export default Home;
