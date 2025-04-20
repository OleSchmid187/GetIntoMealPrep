using System.ComponentModel.DataAnnotations;
using GetIntoMealPrepAPI.Enums;

namespace GetIntoMealPrepAPI.Models
{
    public class MealPlanEntry
    {
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public int RecipeId { get; set; }

        private DateTime _date;

        [Required]
        public DateTime Date
        {
            get => _date;
            set => _date = DateTime.SpecifyKind(value, DateTimeKind.Utc);
        }

        [Required]
        public MealType MealType { get; set; }

        public int Position { get; set; } = 0;

        private DateTime _createdAt = DateTime.UtcNow;
        public DateTime CreatedAt
        {
            get => _createdAt;
            set => _createdAt = DateTime.SpecifyKind(value, DateTimeKind.Utc);
        }

        private DateTime _updatedAt = DateTime.UtcNow;
        public DateTime UpdatedAt
        {
            get => _updatedAt;
            set => _updatedAt = DateTime.SpecifyKind(value, DateTimeKind.Utc);
        }

        public User User { get; set; } = null!;
        public Recipe Recipe { get; set; } = null!;
    }
}
