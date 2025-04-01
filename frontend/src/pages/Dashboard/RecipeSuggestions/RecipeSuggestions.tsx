import "./RecipeSuggestions.css";
import food1 from "../../../assets/food1.png";
import food2 from "../../../assets/food2.png";
import food3 from "../../../assets/food3.png";

const recipes = [
  { title: "Pasta Primavera", image: food1 },
  { title: "Veggie Bowl", image: food2 },
  { title: "Linsensuppe", image: food3 },
  { title: "Quinoa Salat", image: food1 },
  { title: "Chili sin Carne", image: food2 },
  { title: "Ofengemüse", image: food3 },
];

function RecipeSuggestions() {
  return (
    <div className="recipe-suggestions">
      <h3>Probier doch mal folgende Rezepte:</h3>
      <div className="recipe-grid">
        {recipes.map((r, index) => (
          <div className="recipe-card" key={index}>
            <img src={r.image} alt={r.title} />
            <p>{r.title}</p>
          </div>
        ))}
      </div>
      <button className="more-btn">Mehr Rezepte entdecken</button>
    </div>
  );
}

export default RecipeSuggestions;
