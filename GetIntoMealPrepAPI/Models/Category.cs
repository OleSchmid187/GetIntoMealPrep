using System.ComponentModel.DataAnnotations;

namespace GetIntoMealPrepAPI.Models;

public class Category
{
    public int Id { get; set; }

    [Required]
    public string Name { get; set; }

    public ICollection<RecipeCategory> Recipes { get; set; } = new List<RecipeCategory>();
}