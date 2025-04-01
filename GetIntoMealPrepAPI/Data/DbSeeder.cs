using GetIntoMealPrepAPI.Models;
using GetIntoMealPrepAPI.Enums;

namespace GetIntoMealPrepAPI.Data;

public static class DbSeeder
{
    public static void Seed(AppDbContext db)
    {
        if (db.Recipes.Any()) return; // DB schon gefüllt? -> Abbrechen

        // Zutaten mit Bildpfaden
        var reis = new Ingredient
        {
            Name = "Reis",
            Price = 1.49m,
            CaloriesPer100g = 130,
            Protein = 2.7f,
            Fat = 0.3f,
            Carbs = 28f,
            ImageUrl = "/resources/ingredients/ingredient_reis.png"
        };

        var brokkoli = new Ingredient
        {
            Name = "Brokkoli",
            Price = 0.89m,
            CaloriesPer100g = 34,
            Protein = 2.8f,
            Fat = 0.4f,
            Carbs = 7.2f,
            ImageUrl = "/resources/ingredients/ingredient_brokkoli.png"
        };

        var tofu = new Ingredient
        {
            Name = "Tofu",
            Price = 2.50m,
            CaloriesPer100g = 145,
            Protein = 15.0f,
            Fat = 9.0f,
            Carbs = 3.9f,
            ImageUrl = "/resources/ingredients/ingredient_tofu.png"
        };

        var paprika = new Ingredient
        {
            Name = "Paprika",
            Price = 1.10m,
            CaloriesPer100g = 31,
            Protein = 1.0f,
            Fat = 0.3f,
            Carbs = 6.0f,
            ImageUrl = "/resources/ingredients/ingredient_paprika.png"
        };

        db.Ingredients.AddRange(reis, brokkoli, tofu, paprika);

        // Kategorien
        var vegan = new Category { Name = "Vegan" };
        var vegetarisch = new Category { Name = "Vegetarisch" };

        db.Categories.AddRange(vegan, vegetarisch);

        db.SaveChanges();

        // Rezept 1: Vegane Reispfanne mit lokalem Bildpfad
        var recipe1 = new Recipe
        {
            Name = "Vegane Reispfanne",
            Description = "Eine einfache und leckere Reispfanne mit Tofu und Gemüse.",
            Instructions = "Reis kochen. Tofu anbraten. Gemüse klein schneiden und anbraten. Alles zusammen in die Pfanne geben und würzen.",
            PortionCount = 4,
            Difficulty = RecipeDifficulty.Medium,
            CaloriesPerServing = 480,
            ImageUrl = "/resources/recipes/recipe_vegane_reispfanne.png",
            Ingredients = new List<RecipeIngredient>
            {
                new RecipeIngredient { Ingredient = reis, Quantity = 200, Unit = "g" },
                new RecipeIngredient { Ingredient = brokkoli, Quantity = 150, Unit = "g" },
                new RecipeIngredient { Ingredient = tofu, Quantity = 250, Unit = "g" },
                new RecipeIngredient { Ingredient = paprika, Quantity = 100, Unit = "g" },
            },
            Categories = new List<RecipeCategory>
            {
                new RecipeCategory { Category = vegan }
            }
        };

        db.Recipes.Add(recipe1);

        // Rezept 2: Vegetarische Gemüsepfanne
        var recipe2 = new Recipe
        {
            Name = "Vegetarische Gemüsepfanne",
            Description = "Eine bunte Gemüsepfanne mit frischen Zutaten.",
            Instructions = "Gemüse klein schneiden. In einer Pfanne mit etwas Öl anbraten. Mit Salz und Pfeffer abschmecken.",
            PortionCount = 2,
            Difficulty = RecipeDifficulty.Easy,
            CaloriesPerServing = 350,
            ImageUrl = "/resources/recipes/recipe_gemuesepfanne.png",
            Ingredients = new List<RecipeIngredient>
            {
                new RecipeIngredient { Ingredient = brokkoli, Quantity = 200, Unit = "g" },
                new RecipeIngredient { Ingredient = paprika, Quantity = 150, Unit = "g" }
            },
            Categories = new List<RecipeCategory>
            {
                new RecipeCategory { Category = vegetarisch }
            }
        };

        // Rezept 3: Tofu-Curry
        var recipe3 = new Recipe
        {
            Name = "Tofu-Curry",
            Description = "Ein würziges Curry mit Tofu und Gemüse.",
            Instructions = "Tofu würfeln und anbraten. Gemüse schneiden und in einer Pfanne mit Curry-Paste anbraten. Kokosmilch hinzufügen und köcheln lassen.",
            PortionCount = 3,
            Difficulty = RecipeDifficulty.Medium,
            CaloriesPerServing = 520,
            ImageUrl = "/resources/recipes/recipe_tofu_curry.png",
            Ingredients = new List<RecipeIngredient>
            {
                new RecipeIngredient { Ingredient = tofu, Quantity = 300, Unit = "g" },
                new RecipeIngredient { Ingredient = paprika, Quantity = 200, Unit = "g" }
            },
            Categories = new List<RecipeCategory>
            {
                new RecipeCategory { Category = vegan }
            }
        };

        db.Recipes.AddRange(recipe2, recipe3);

        db.SaveChanges();
    }
}
