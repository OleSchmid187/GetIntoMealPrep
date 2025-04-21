using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GetIntoMealPrepAPI.Data;
using GetIntoMealPrepAPI.Models;

namespace GetIntoMealPrepAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RecipeController : BaseController
{  
    public RecipeController(AppDbContext context) : base(context) { }

    [HttpGet]
    public async Task<ActionResult> GetAll([FromQuery] int start = 0, [FromQuery] int limit = 32)
    {
        var totalRecipes = await _context.Recipes.CountAsync();

        var recipes = await _context.Recipes
            .Include(r => r.Ingredients)
                .ThenInclude(ri => ri.Ingredient)
            .Include(r => r.Categories)
                .ThenInclude(rc => rc.Category)
            .Skip(start)
            .Take(limit)
            .ToListAsync();

        return Ok(new
        {
            data = recipes,
            total = totalRecipes
        });
    }

    [HttpGet("sorted-by-name")]
    public async Task<ActionResult> GetSortedByName()
    {
        var recipes = await _context.Recipes
            .OrderBy(r => r.Name)
            .Select(r => new {
                r.Id,
                r.Name,
                r.ImageUrl
            })
            .ToListAsync();

        return Ok(recipes);
    }

    [HttpGet("search")]
    public async Task<ActionResult> Search([FromQuery] string q)
    {
        var query = q?.ToLower() ?? "";

        var results = await _context.Recipes
            .Where(r => r.Name.ToLower().Contains(query))
            .OrderBy(r => r.Name)
            .Select(r => new {
                r.Id,
                r.Name,
                r.ImageUrl
            })
            .ToListAsync();

        return Ok(results);
    }

    [HttpGet("favorites")]
    public async Task<IActionResult> GetFavorites([FromQuery] int start = 0, [FromQuery] int limit = 32)
    {
        var user = await GetOrCreateUserAsync();

        var totalFavorites = user.FavoriteRecipes.Count;

        var favorites = user.FavoriteRecipes
            .Skip(start)
            .Take(limit)
            .Select(r => new
            {
                r.Id,
                r.Name,
                r.ImageUrl,
                r.CaloriesPerServing,
                r.Difficulty
            });

        return Ok(new
        {
            data = favorites,
            total = totalFavorites
        });
    }

    [HttpGet("count")]
    public async Task<ActionResult<int>> GetRecipeCount()
    {
        var totalRecipes = await _context.Recipes.CountAsync();
        return Ok(totalRecipes);
    }

    [HttpGet("random")]
    public async Task<ActionResult> GetRandomRecipes([FromQuery] int count = 5)
    {
        var totalRecipes = await _context.Recipes.CountAsync();
        if (count > totalRecipes) count = totalRecipes;

        var randomRecipes = await _context.Recipes
            .OrderBy(r => Guid.NewGuid())
            .Take(count)
            .Include(r => r.Ingredients)
                .ThenInclude(ri => ri.Ingredient)
            .Include(r => r.Categories)
                .ThenInclude(rc => rc.Category)
            .ToListAsync();

        return Ok(randomRecipes);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Recipe>> Get(int id)
    {
        var recipe = await _context.Recipes
            .Include(r => r.Ingredients)
                .ThenInclude(ri => ri.Ingredient)
            .Include(r => r.Categories)
                .ThenInclude(rc => rc.Category)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (recipe == null) return NotFound();
        return Ok(recipe);
    }

    [HttpGet("{id:int}/ingredients")]
    public async Task<ActionResult> GetIngredients(int id)
    {
        var recipe = await _context.Recipes
            .Include(r => r.Ingredients)
                .ThenInclude(ri => ri.Ingredient)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (recipe == null) return NotFound();

        var ingredients = recipe.Ingredients.Select(ri => new
        {
            ri.Ingredient.Id,
            ri.Ingredient.Name,
            ri.Ingredient.Price,
            ri.Ingredient.CaloriesPer100g,
            ri.Ingredient.Protein,
            ri.Ingredient.Fat,
            ri.Ingredient.Carbs,
            ri.Ingredient.ImageUrl,
            ri.Quantity,
            ri.Unit
        });

        return Ok(ingredients);
    }

    [HttpPost("{id:int}/like")]
    public async Task<IActionResult> LikeRecipe(int id)
    {
        var recipe = await _context.Recipes.FindAsync(id);
        if (recipe == null) return NotFound("Rezept nicht gefunden.");

        var user = await GetOrCreateUserAsync();

        if (user.FavoriteRecipes.Any(r => r.Id == id))
            return BadRequest("Rezept wurde bereits geliked.");

        user.FavoriteRecipes.Add(recipe);
        await _context.SaveChangesAsync();

        return Ok("Rezept wurde geliked.");
    }

    [HttpPost("{id:int}/unlike")]
    public async Task<IActionResult> UnlikeRecipe(int id)
    {
        var user = await GetOrCreateUserAsync();

        var recipe = user.FavoriteRecipes.FirstOrDefault(r => r.Id == id);
        if (recipe == null)
            return NotFound("Rezept ist nicht in deinen Favoriten.");

        user.FavoriteRecipes.Remove(recipe);
        await _context.SaveChangesAsync();

        return Ok("Rezept wurde entliket.");
    }

    [HttpGet("{id:int}/is-liked")]
    public async Task<ActionResult<bool>> IsRecipeLiked(int id)
    {
        var user = await GetOrCreateUserAsync();

        var isLiked = user.FavoriteRecipes.Any(r => r.Id == id);

        return Ok(isLiked);
    }
}
