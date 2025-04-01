import "./HeroSection.css";

import food1 from "../../../assets/food1.png";
import food2 from "../../../assets/food2.png";
import food3 from "../../../assets/food3.png";
import food4 from "../../../assets/food4.png";
import food5 from "../../../assets/food5.png";
import food6 from "../../../assets/food6.png";
import food7 from "../../../assets/food7.png";
import food8 from "../../../assets/food8.png";
import food9 from "../../../assets/food9.png";

function HeroSection() {
  const images = [food1, food2, food3, food4, food5, food6, food7, food8, food9];

  // Dopplung für Loop
  const loopImages = [...images, ...images];

  return (
    <section className="home-hero-section">
      <div className="home-image-loop-wrapper">
        <div className="home-image-loop">
          {loopImages.map((img, index) => (
            <img key={index} src={img} alt={`Meal ${index + 1}`} />
          ))}
        </div>
      </div>
      <div className="home-text-block">
        <h1>Finde Deine Balance</h1>
        <p>mit ausgewogenen Gerichten zum Selbstkochen.</p>
      </div>
    </section>
  );
}

export default HeroSection;
