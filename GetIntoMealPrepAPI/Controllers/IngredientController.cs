using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GetIntoMealPrepAPI.Data;
using GetIntoMealPrepAPI.Models;

namespace GetIntoMealPrepAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class IngredientController : ControllerBase
{
    private readonly AppDbContext _context;

    public IngredientController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Ingredient>>> GetAll()
    {
        return await _context.Ingredients.ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Ingredient>> Create(Ingredient ingredient)
    {
        _context.Ingredients.Add(ingredient);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = ingredient.Id }, ingredient);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var ingredient = await _context.Ingredients.FindAsync(id);
        if (ingredient == null) return NotFound();

        _context.Ingredients.Remove(ingredient);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id}/upload-image")]
    public async Task<IActionResult> UploadImage(int id, IFormFile file)
    {
        var ingredient = await _context.Ingredients.FindAsync(id);
        if (ingredient == null) return NotFound();

        var fileName = $"ingredient_{ingredient.Name.Replace(" ", "_").ToLower()}.png";
        var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "Resources", "ingredients");
        Directory.CreateDirectory(folderPath);

        var fullPath = Path.Combine(folderPath, fileName);
        using var stream = new FileStream(fullPath, FileMode.Create);
        await file.CopyToAsync(stream);

        ingredient.ImageUrl = $"/resources/ingredients/{fileName}";
        await _context.SaveChangesAsync();

        return Ok(new { ingredient.ImageUrl });
    }
}
