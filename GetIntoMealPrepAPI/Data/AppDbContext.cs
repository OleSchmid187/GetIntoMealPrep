using Microsoft.EntityFrameworkCore;
using GetIntoMealPrepAPI.Models;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace GetIntoMealPrepAPI.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

    public DbSet<Recipe> Recipes { get; set; }
    public DbSet<Ingredient> Ingredients { get; set; }
    public DbSet<RecipeIngredient> RecipeIngredients { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<RecipeCategory> RecipeCategories { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<MealPlanEntry> MealPlanEntries { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Composite key for RecipeIngredient
        modelBuilder.Entity<RecipeIngredient>()
            .HasKey(ri => new { ri.RecipeId, ri.IngredientId });

        modelBuilder.Entity<RecipeIngredient>()
            .HasOne(ri => ri.Recipe)
            .WithMany(r => r.Ingredients)
            .HasForeignKey(ri => ri.RecipeId);

        modelBuilder.Entity<RecipeIngredient>()
            .HasOne(ri => ri.Ingredient)
            .WithMany()
            .HasForeignKey(ri => ri.IngredientId);

        // Composite key for RecipeCategory
        modelBuilder.Entity<RecipeCategory>()
            .HasKey(rc => new { rc.RecipeId, rc.CategoryId });

        modelBuilder.Entity<RecipeCategory>()
            .HasOne(rc => rc.Recipe)
            .WithMany(r => r.Categories)
            .HasForeignKey(rc => rc.RecipeId);

        modelBuilder.Entity<RecipeCategory>()
            .HasOne(rc => rc.Category)
            .WithMany()
            .HasForeignKey(rc => rc.CategoryId);

        // ✅ User setup
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Sub)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasMany(u => u.FavoriteRecipes)
            .WithMany()
            .UsingEntity(j => j.ToTable("UserFavoriteRecipes"));

        // ✅ MealPlanEntry setup
        modelBuilder.Entity<MealPlanEntry>()
            .HasIndex(e => new { e.UserId, e.Date, e.MealType, e.Position })
            .IsUnique();

        modelBuilder.Entity<MealPlanEntry>()
            .HasOne(e => e.User)
            .WithMany()
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<MealPlanEntry>()
            .HasOne(e => e.Recipe)
            .WithMany()
            .HasForeignKey(e => e.RecipeId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<MealPlanEntry>()
            .Property(e => e.MealType)
            .HasConversion<string>();

        // 🕒 Stelle sicher: Alle DateTime-Werte sind UTC
        var dateTimeConverter = new ValueConverter<DateTime, DateTime>(
            v => v.ToUniversalTime(),
            v => DateTime.SpecifyKind(v, DateTimeKind.Utc)
        );

        modelBuilder.Entity<MealPlanEntry>()
            .Property(e => e.Date)
            .HasConversion(dateTimeConverter);

        modelBuilder.Entity<MealPlanEntry>()
            .Property(e => e.CreatedAt)
            .HasConversion(dateTimeConverter);

        modelBuilder.Entity<MealPlanEntry>()
            .Property(e => e.UpdatedAt)
            .HasConversion(dateTimeConverter);
    }
}
