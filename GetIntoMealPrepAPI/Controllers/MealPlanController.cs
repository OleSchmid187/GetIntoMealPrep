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

    // 📅 GET: Wochenplan für User
    [HttpGet]
    public async Task<IActionResult> GetWeeklyPlan([FromQuery] int weekOffset = 0)
    {
        var user = await GetOrCreateUserAsync();

        var (start, end) = DateHelper.GetWeekRange(weekOffset);

        var entries = await _context.MealPlanEntries
            .Where(e => e.UserId == user.Id && e.Date >= start && e.Date <= end)
            .Include(e => e.Recipe)
            .ToListAsync();

        return Ok(entries);
    }

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

        return Ok(entry);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateEntry(int id, [FromBody] MealPlanEntry updated)
    {
        if (id != updated.Id)
            return BadRequest("ID mismatch.");

        var user = await GetOrCreateUserAsync();
        var entry = await _context.MealPlanEntries.FirstOrDefaultAsync(e => e.Id == id && e.UserId == user.Id);

        if (entry == null)
            return NotFound("Eintrag nicht gefunden.");

        entry.Date = updated.Date;
        entry.MealType = updated.MealType;
        entry.Position = updated.Position;
        entry.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(entry);
    }

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
