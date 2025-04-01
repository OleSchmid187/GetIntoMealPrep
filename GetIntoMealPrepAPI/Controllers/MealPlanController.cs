using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GetIntoMealPrepAPI.Data;

[ApiController]
[Route("api/[controller]")]
public class MealPlanController : ControllerBase
{
    private readonly AppDbContext _context;
    public MealPlanController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var plans = await _context.MealPlans.ToListAsync();
        return Ok(plans);
    }

    [HttpPost]
    public async Task<IActionResult> Create(MealPlan plan)
    {
        _context.MealPlans.Add(plan);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = plan.Id }, plan);
    }
}
