using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GetIntoMealPrepAPI.Data;
using GetIntoMealPrepAPI.Models;

namespace GetIntoMealPrepAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RecipeController : ControllerBase
{
    private readonly AppDbContext _context;

    public RecipeController(AppDbContext context)
    {
        _context = context;
    }

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

    [HttpGet("{id}")]
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

    [HttpPost]
    public async Task<ActionResult<Recipe>> Create(Recipe recipe)
    {
        _context.Recipes.Add(recipe);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = recipe.Id }, recipe);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Recipe updated)
    {
        if (id != updated.Id) return BadRequest();

        _context.Entry(updated).State = EntityState.Modified;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var recipe = await _context.Recipes.FindAsync(id);
        if (recipe == null) return NotFound();

        _context.Recipes.Remove(recipe);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id}/upload-image")]
    public async Task<IActionResult> UploadImage(int id, IFormFile file)
    {
        var recipe = await _context.Recipes.FindAsync(id);
        if (recipe == null) return NotFound();

        var fileName = $"recipe_{recipe.Name.Replace(" ", "_").ToLower()}.png";
        var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "Resources", "recipes");
        Directory.CreateDirectory(folderPath);

        var fullPath = Path.Combine(folderPath, fileName);
        using var stream = new FileStream(fullPath, FileMode.Create);
        await file.CopyToAsync(stream);

        recipe.ImageUrl = $"/resources/recipes/{fileName}";
        await _context.SaveChangesAsync();

        return Ok(new { recipe.ImageUrl });
    }

    [HttpGet("{id}/ingredients")]
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
            ri.Quantity,
            ri.Unit
        });

        return Ok(ingredients);
    }
}
