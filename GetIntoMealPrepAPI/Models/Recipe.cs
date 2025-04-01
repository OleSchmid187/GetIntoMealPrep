using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using GetIntoMealPrepAPI.Enums; 

namespace GetIntoMealPrepAPI.Models;

public class Recipe
{
    public int Id { get; set; }

    [Required]
    public string Name { get; set; }

    public string? Description { get; set; }

    public string Instructions { get; set; }

    public int PortionCount { get; set; }

    [Required]
    public RecipeDifficulty Difficulty { get; set; }

    public float CaloriesPerServing { get; set; }

    public string? ImageUrl { get; set; }

    [JsonIgnore]
    public ICollection<RecipeIngredient> Ingredients { get; set; } = new List<RecipeIngredient>();

    [JsonIgnore]
    public ICollection<RecipeCategory> Categories { get; set; } = new List<RecipeCategory>();
}