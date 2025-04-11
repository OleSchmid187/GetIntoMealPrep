using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace GetIntoMealPrepAPI.Models;

public class User
{
    public int Id { get; set; }

    [Required]
    public string Sub { get; set; } = null!; // vom JWT-Token

    [JsonIgnore]
    public ICollection<Recipe> FavoriteRecipes { get; set; } = new List<Recipe>();
}