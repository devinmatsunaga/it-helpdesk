using HelpdeskApi.Data;
using HelpdeskApi.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HelpdeskApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ArticleCategoriesController : ControllerBase
{
    private readonly HelpdeskDbContext _db;
    public ArticleCategoriesController(HelpdeskDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<List<ArticleCategoryResponse>>> GetAll()
    {
        var items = await _db.ArticleCategories
            .Where(c => c.IsActive)
            .OrderBy(c => c.Name)
            .Select(c => new ArticleCategoryResponse { Id = c.Id, Name = c.Name })
            .ToListAsync();
        return Ok(items);
    }
}