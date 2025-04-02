import { useState, useEffect } from "react";
import { Paginator } from "primereact/paginator";
import { fetchPaginatedRecipes } from "../../../api/recipeApi"; // Import the new API function
import RecipeCard from "../../Dashboard/RecipeSuggestions/RecipeCard/RecipeCard";
import Header from "../../../components/Header/Header";
import "./AllRecipes.css";
import { Recipe } from "../../../types/recipe";


function AllRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [first, setFirst] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const recipesPerPage = 18;

  const fetchRecipes = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, total } = await fetchPaginatedRecipes(first, recipesPerPage);
      setRecipes(data);
      setTotalRecords(total);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [first]);

  const onPageChange = (e: { first: number }) => {
    setFirst(e.first);
  };

  return (
    <>
      <Header />
      <div className="all-recipes">
        <h2>Alle Rezepte</h2>
        {loading && <p>Rezepte werden geladen...</p>}
        {error && <p>Fehler beim Laden der Rezepte: {error.message}</p>}
        <div className="recipe-grid">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} onSelect={() => {}} />
          ))}
        </div>
        <Paginator
          first={first}
          rows={recipesPerPage}
          totalRecords={totalRecords}
          onPageChange={onPageChange}
        />
      </div>
    </>
  );
}

export default AllRecipes;
