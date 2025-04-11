using GetIntoMealPrepAPI.Data;
using GetIntoMealPrepAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace GetIntoMealPrepAPI.Controllers;

[Authorize]
public abstract class BaseController : ControllerBase
{
    protected readonly AppDbContext _context;

    protected BaseController(AppDbContext context)
    {
        _context = context;
    }

    protected string GetUserId()
    {
        // Try 'sub' first, fall back to NameIdentifier
        var userId = User.FindFirst("sub")?.Value 
                  ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId))
            throw new UnauthorizedAccessException("Token enthält keine gültige User-ID ('sub'-Claim fehlt).");

        return userId;
    }

    protected virtual async Task<User> GetOrCreateUserAsync()
    {
        var userId = GetUserId();

        var user = await _context.Users
            .Include(u => u.FavoriteRecipes)
            .FirstOrDefaultAsync(u => u.Sub == userId);

        if (user == null)
        {
            user = new User { Sub = userId };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }

        return user;
    }
}
