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

public class AssetsController : ControllerBase
{
    private readonly HelpdeskDbContext _db;
    public AssetsController(HelpdeskDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<List<AssetResponse>>> GetAll()
    {
        var items = await _db.Assets
            .Where(a => a.IsActive)
            .OrderBy(a => a.AssetTag)
            .Select(a => new AssetResponse
            {
                Id = a.Id,
                AssetTag = a.AssetTag,
                Name = a.Name,
                Location = a.Location,
            })
            .ToListAsync();
        return Ok(items);
    }
}