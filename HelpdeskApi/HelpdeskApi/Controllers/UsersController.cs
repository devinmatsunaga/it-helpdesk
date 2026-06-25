using System.Drawing;
using HelpdeskApi.Data;
using HelpdeskApi.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using HelpdeskApi.Models.Enums;


namespace HelpdeskApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]

public class UsersController : ControllerBase
{
    private readonly HelpdeskDbContext _db;
    public UsersController(HelpdeskDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<List<UserResponse>>> GetAll()
    {
        var items = await _db.Users
            .Where(u => u.IsActive)
            .OrderBy(u => u.DisplayName)
            .Select(u => new UserResponse
            {
                Id = u.Id,
                DisplayName = u.DisplayName,
                Email = u.Email,
                Role = u.Role
            })
            .ToListAsync();
        return Ok(items);        
    }

    [HttpGet("agents")]
    public async Task<ActionResult<List<UserResponse>>> GetAgents()
    {
        var items = await _db.Users
            .Where(u => u.IsActive && (u.Role == Models.Enums.UserRole.Agent || u.Role == Models.Enums.UserRole.Admin))
            .OrderBy(u => u.DisplayName)
            .Select(u => new UserResponse
            {
                Id = u.Id,
                DisplayName = u.DisplayName,
                Email = u.Email,
                Role = u.Role
            })
            .ToListAsync();
    return Ok(items);
    }
}