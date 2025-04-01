using Microsoft.EntityFrameworkCore;
using GetIntoMealPrepAPI.Models;

namespace GetIntoMealPrepAPI.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

    public DbSet<Recipe> Recipes { get; set; }
    public DbSet<Ingredient> Ingredients { get; set; }
    public DbSet<RecipeIngredient> RecipeIngredients { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<RecipeCategory> RecipeCategories { get; set; }

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
    }
}
