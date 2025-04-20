using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GetIntoMealPrepAPI.Data;
using GetIntoMealPrepAPI.Models;
using GetIntoMealPrepAPI.Enums;
using GetIntoMealPrepAPI.Utils;
using GetIntoMealPrepAPI.Dtos;

namespace GetIntoMealPrepAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MealPlanController : BaseController
{
    public MealPlanController(AppDbContext context) : base(context) { }

    // GET: Wochenplan für User
    [HttpGet]
    public async Task<IActionResult> GetWeeklyPlan([FromQuery] int weekOffset = 0)
    {
        var user = await GetOrCreateUserAsync();
        var (start, end) = DateHelper.GetWeekRange(weekOffset);

        var entries = await _context.MealPlanEntries
            .Where(e => e.UserId == user.Id && e.Date >= start && e.Date <= end)
            .Include(e => e.Recipe)
            .OrderBy(e => e.Date)
            .ThenBy(e => e.MealType)
            .ThenBy(e => e.Position)
            .ToListAsync();

        var result = entries.Select(e => new
        {
            e.Id,
            e.Date,
            e.MealType,
            e.Position,
            Recipe = new
            {
                e.Recipe.Id,
                e.Recipe.Name,
                e.Recipe.ImageUrl
            }
        });

        return Ok(result);
    }

    // POST: Eintrag hinzufügen
    [HttpPost]
    public async Task<IActionResult> AddEntry([FromBody] MealPlanEntryDto dto)
    {
        if (!Enum.TryParse<MealType>(dto.MealType, true, out var mealType))
            return BadRequest("Ungültiger MealType");

        if (!DateTime.TryParse(dto.Date, out var parsedDate))
            return BadRequest("Ungültiges Datum");

        var user = await GetOrCreateUserAsync();

        var entry = new MealPlanEntry
        {
            UserId = user.Id,
            RecipeId = dto.RecipeId,
            MealType = mealType,
            Date = DateTime.SpecifyKind(parsedDate, DateTimeKind.Utc),
            Position = dto.Position,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.MealPlanEntries.Add(entry);
        await _context.SaveChangesAsync();

        // Recipe laden
        var recipe = await _context.Recipes.FindAsync(dto.RecipeId);

        return Ok(new
        {
            entry.Id,
            entry.Date,
            entry.MealType,
            entry.Position,
            Recipe = new
            {
                recipe?.Id,
                recipe?.Name,
                recipe?.ImageUrl
            }
        });
    }

    // PUT: Eintrag aktualisieren (Drag & Drop)
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateEntry(int id, [FromBody] MealPlanEntryDto dto)
    {
        if (!Enum.TryParse<MealType>(dto.MealType, true, out var mealType))
            return BadRequest("Ungültiger MealType");

        if (!DateTime.TryParse(dto.Date, out var parsedDate))
            return BadRequest("Ungültiges Datum");

        var user = await GetOrCreateUserAsync();

        var entry = await _context.MealPlanEntries
            .Include(e => e.Recipe)
            .FirstOrDefaultAsync(e => e.Id == id && e.UserId == user.Id);

        if (entry == null)
            return NotFound("Eintrag nicht gefunden.");

        entry.Date = DateTime.SpecifyKind(parsedDate, DateTimeKind.Utc);
        entry.MealType = mealType;
        entry.Position = dto.Position;
        entry.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            entry.Id,
            entry.Date,
            entry.MealType,
            entry.Position,
            Recipe = new
            {
                entry.Recipe.Id,
                entry.Recipe.Name,
                entry.Recipe.ImageUrl
            }
        });
    }

    // DELETE: Eintrag löschen
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEntry(int id)
    {
        var user = await GetOrCreateUserAsync();
        var entry = await _context.MealPlanEntries.FirstOrDefaultAsync(e => e.Id == id && e.UserId == user.Id);

        if (entry == null)
            return NotFound("Eintrag nicht gefunden.");

        _context.MealPlanEntries.Remove(entry);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
