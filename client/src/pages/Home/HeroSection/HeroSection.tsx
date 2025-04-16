import "./HeroSection.css";
import food1 from "../../../assets/recipe_african_stew.jpg";
import food2 from "../../../assets/recipe_bircher_muesli.jpg";
import food3 from "../../../assets/recipe_brokkoli_auflauf.jpg";
import food4 from "../../../assets/recipe_chili_con_carne.jpg";
import food5 from "../../../assets/recipe_china_nudeln.jpg";
import food6 from "../../../assets/recipe_griechischer_schichtsalat.jpg";
import food7 from "../../../assets/recipe_italienischer_nudelsalat.jpg";
import food8 from "../../../assets/recipe_klassischer_reissalat.jpg";
import food9 from "../../../assets/recipe_mexikanische_fajitas.jpg";

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
      <div className="home-text-block-wrapper">
        <div className="home-text-block">
          <h1>
            <span>Finde</span> Deine Balance
          </h1>
          <p>
            <span>mit ausgewogenen Gerichten</span> zum Selbstkochen.
          </p>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
