using System.ComponentModel.DataAnnotations;

namespace GetIntoMealPrepAPI.Models;

public class Recipe
{
    public int Id { get; set; }

    [Required]
    public string Name { get; set; }

    public string? Description { get; set; }

    public string Instructions { get; set; }

    public int PortionCount { get; set; }

    public string Difficulty { get; set; } // "Leicht", "Mittel", "Schwer"

    public float Calories { get; set; }

    public string? ImageUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<RecipeIngredient> Ingredients { get; set; } = new List<RecipeIngredient>();
    public ICollection<RecipeCategory> Categories { get; set; } = new List<RecipeCategory>();
}