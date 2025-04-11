using GetIntoMealPrepAPI.Data;
using GetIntoMealPrepAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GetIntoMealPrepAPI.Controllers;

[Authorize]
public abstract class BaseController : ControllerBase
{
    protected readonly AppDbContext _context;

    protected BaseController(AppDbContext context)
    {
        _context = context;
    }

    protected async Task<User> GetOrCreateUserAsync()
    {
        var sub = User.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;

        if (string.IsNullOrEmpty(sub))
            throw new UnauthorizedAccessException("JWT enthält keinen 'sub'-Claim.");

        var user = await _context.Users
            .Include(u => u.FavoriteRecipes)
            .FirstOrDefaultAsync(u => u.Sub == sub);

        if (user == null)
        {
            user = new User { Sub = sub };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }

        return user;
    }
}
