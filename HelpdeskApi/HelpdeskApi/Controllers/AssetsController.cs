using System.Drawing;
using HelpdeskApi.Data;
using HelpdeskApi.DTOs;
using HelpdeskApi.Models;
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
    public async Task<ActionResult<PagedResult<AssetResponse>>> GetAll(
    [FromQuery] string? search,
    [FromQuery] string? type,
    [FromQuery] string? status,        // "active" | "retired" | null (all)
    [FromQuery] string? assignment,    // "assigned" | "unassigned" | null (all)
    [FromQuery] string? sortBy,        // "tag" | "name" | "created"
    [FromQuery] string? sortDir,       // "asc" | "desc"
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 10)
    {
        // Start with the base query (not yet executed — IQueryable builds up SQL).
        var query = _db.Assets
            .Include(a => a.AssignedToUser)
            .AsQueryable();

        // --- Filters: each one conditionally narrows the query ---
        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(a => a.AssetTag.Contains(search) || a.Name.Contains(search));

        if (!string.IsNullOrWhiteSpace(type))
            query = query.Where(a => a.Type == type);

        if (status == "active")
            query = query.Where(a => a.IsActive);
        else if (status == "retired")
            query = query.Where(a => !a.IsActive);

        if (assignment == "assigned")
            query = query.Where(a => a.AssignedToUserId != null);
        else if (assignment == "unassigned")
            query = query.Where(a => a.AssignedToUserId == null);

        // --- Sorting ---
        bool desc = sortDir == "desc";
        query = sortBy switch
        {
            "name"    => desc ? query.OrderByDescending(a => a.Name)      : query.OrderBy(a => a.Name),
            "created" => desc ? query.OrderByDescending(a => a.CreatedAt) : query.OrderBy(a => a.CreatedAt),
            _         => desc ? query.OrderByDescending(a => a.AssetTag)  : query.OrderBy(a => a.AssetTag), // default: tag
        };

        // --- Count BEFORE paging (total matching rows, for page math) ---
        var totalCount = await query.CountAsync();

        // --- Page: skip past prior pages, take this page's worth ---
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 10;   // guard against silly values

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new AssetResponse
            {
                Id = a.Id,
                AssetTag = a.AssetTag,
                Name = a.Name,
                Type = a.Type,
                Location = a.Location,
                IsActive = a.IsActive,
                AssignedToName = a.AssignedToUser != null ? a.AssignedToUser.DisplayName : null
            })
            .ToListAsync();

        return Ok(new PagedResult<AssetResponse>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        });
    }

    [HttpGet("types")]
    public async Task<ActionResult<List<string>>> GetTypes()
    {
        var types = await _db.Assets
            .Where(a => a.Type != null && a.Type != "")
            .Select(a => a.Type!)
            .Distinct()
            .OrderBy(t => t)
            .ToListAsync();
        return Ok(types);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<AssetDetailResponse>> GetById(int id)
    {
        var asset = await _db.Assets
            .Include(a => a.AssignedToUser)
            .Include(a => a.Tickets)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (asset is null) return NotFound();

        return Ok(new AssetDetailResponse
        {
            Id = asset.Id,
            AssetTag = asset.AssetTag,
            Name = asset.Name,
            Type = asset.Type,
            Location = asset.Location,
            SerialNumber = asset.SerialNumber,
            PurchaseDate = asset.PurchaseDate,
            WarrantyExpiry = asset.WarrantyExpiry,
            AssignedToUserId = asset.AssignedToUserId,
            AssignedToName = asset.AssignedToUser?.DisplayName,
            IsActive = asset.IsActive,
            CreatedAt = asset.CreatedAt,
            Tickets = asset.Tickets
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new AssetTicketItem
                {
                    Id = t.Id,
                    Title = t.Title,
                    Status = t.Status,
                    Priority = t.Priority,
                    CreatedAt = t.CreatedAt
                }).ToList()
        });

    }

    [HttpPost]
    [Authorize(Roles = "Agent,Admin")]
    public async Task<ActionResult<AssetDetailResponse>> Create(CreateAssetRequest request)
    {
        var asset = new Asset
        {
            AssetTag = request.AssetTag,
            Name = request.Name,
            Type = request.Type,
            Location = request.Location,
            SerialNumber = request.SerialNumber,
            PurchaseDate = request.PurchaseDate,
            WarrantyExpiry = request.WarrantyExpiry,
            AssignedToUserId = request.AssignedToUserId,
            IsActive = true
        };
        _db.Assets.Add(asset);
        await _db.SaveChangesAsync();
        return await GetById(asset.Id);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Agent,Admin")]
    public async Task<ActionResult<AssetDetailResponse>> Update(int id, UpdateAssetRequest request)
    {
        var asset = await _db.Assets.FindAsync(id);
        if (asset is null) return NotFound();

        asset.Name = request.Name;
        asset.Type = request.Type;
        asset.Location = request.Location;
        asset.SerialNumber = request.SerialNumber;
        asset.PurchaseDate = request.PurchaseDate;
        asset.WarrantyExpiry = request.WarrantyExpiry;
        asset.AssignedToUserId = request.AssignedToUserId;
        await _db.SaveChangesAsync();
        return await GetById(id);
    }

    [HttpPost("{id:int}/deactivate")]
    [Authorize(Roles = "Agent,Admin")]
    public async Task<IActionResult> Deactivate(int id)
    {
        var asset = await _db.Assets.FindAsync(id);
        if (asset is null) return NotFound();
        asset.IsActive = false;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id:int}/reactivate")]
    [Authorize(Roles = "Agent,Admin")]
    public async Task<IActionResult> Reactivate(int id)
    {
        var asset = await _db.Assets.FindAsync(id);
        if (asset is null) return NotFound();
        asset.IsActive = true;
        await _db.SaveChangesAsync();
        return NoContent();
    }
}