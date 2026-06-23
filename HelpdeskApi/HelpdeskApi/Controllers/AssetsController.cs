using System.Drawing;
using HelpdeskApi.Data;
using HelpdeskApiApi.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HelpdeskApi.Controllers;

[ApiController]
[Route("api/[controller]")]

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