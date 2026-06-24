using System.Drawing;
using HelpdeskApi.Data;
using HelpdeskApi.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace HelpdeskApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CategoriesController : ControllerBase
{
    private readonly HelpdeskDbContext _db;
    public CategoriesController(HelpdeskDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<List<CategoryResponse>>> GetAll()
    {
        var items = await _db.Categories
            .Where(c => c.IsActive)
            .OrderBy(c => c.Name)
            .Select(c => new CategoryResponse {Id = c.Id, Name = c.Name})
            .ToListAsync();
        return Ok(items);
    }
}