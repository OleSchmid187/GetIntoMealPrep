using System.ComponentModel.DataAnnotations;

namespace GetIntoMealPrepAPI.Dtos
{
    public class MealPlanEntryDto
    {
        [Required]
        public int RecipeId { get; set; }

        [Required]
        public string MealType { get; set; } = null!;

        [Required]
        public string Date { get; set; } = null!; // ISO string: "2025-04-15"

        public int Position { get; set; } = 0;
    }
}
