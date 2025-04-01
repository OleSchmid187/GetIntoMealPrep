using System.ComponentModel.DataAnnotations;

namespace GetIntoMealPrepAPI.Models;

public class Ingredient
{
    public int Id { get; set; }

    [Required]
    public string Name { get; set; }

    public decimal Price { get; set; }

    public int CaloriesPer100g { get; set; }
    public float Protein { get; set; }
    public float Fat { get; set; }
    public float Carbs { get; set; }

    public string? ImageUrl { get; set; }
}
