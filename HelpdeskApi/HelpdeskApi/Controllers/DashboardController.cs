using Helpdeskapi.DTOs;
using HelpdeskApi.Data;
using HelpdeskApi.DTOs;
using HelpdeskApi.Models;
using HelpdeskApi.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HelpdeskApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly HelpdeskDbContext _db;
    public DashboardController(HelpdeskDbContext db) => _db =db;

    [HttpGet("summary")]
    public async Task<ActionResult<DashboardSummary>> GetSummary()
    {
        var tickets = await _db.Tickets
            .Select(t => new {t.Status, t.Priority, CategoryName = t.Category!.Name})
            .ToListAsync();

        var totalAssets = await _db.Assets.CountAsync(a => a.IsActive);

        string StatusLabel(TicketStatus s) => s switch
        {
            TicketStatus.New => "New",
            TicketStatus.Open => "Open",
            TicketStatus.InProgress => "InProgress",
            TicketStatus.OnHold => "OnHold",
            TicketStatus.Resolved => "Resolved",
            TicketStatus.Closed => "Closed",
            _ => "Unknown"
        };
        string PriorityLabel(TicketPriority p) => p switch
        {
            TicketPriority.Low => "Low",
            TicketPriority.Medium => "Medium",
            TicketPriority.High => "High",
            TicketPriority.Critical => "Critical",
            _ => "Unknown"
        };

        var summary = new DashboardSummary
        {
            TotalTickets = tickets.Count,
            ClosedTickets = tickets.Count(t => t.Status == TicketStatus.Closed || t.Status == TicketStatus.Resolved),
            OpenTickets = tickets.Count(t => t.Status != TicketStatus.Closed && t.Status != TicketStatus.Resolved),
            TotalAssets = totalAssets,

            ByStatus = tickets
                .GroupBy(t => t.Status)
                .Select(g => new StatItem {Label = StatusLabel(g.Key), Count = g.Count()})
                .ToList(),

            ByPriority = tickets
                .GroupBy(t => t.Priority)
                .Select(g => new StatItem {Label = PriorityLabel(g.Key), Count = g.Count()})
                .ToList(),

            ByCategory = tickets
                .GroupBy(t => t.CategoryName)
                .Select(g => new StatItem {Label = g.Key ?? "Uncategorized", Count = g.Count()})
                .ToList(),
        };
        return Ok(summary);
    }
}