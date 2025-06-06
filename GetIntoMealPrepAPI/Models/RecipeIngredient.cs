namespace GetIntoMealPrepAPI.Models;

public class RecipeIngredient
{
    public int RecipeId { get; set; }
    public Recipe Recipe { get; set; }

    public int IngredientId { get; set; }
    public Ingredient Ingredient { get; set; }

    public float Quantity { get; set; }

    public string Unit { get; set; } // z. B. "g", "ml", "Stück"
}