using HelpdeskApi.Data;
using HelpdeskApi.DTOs;
using HelpdeskApi.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HelpdeskApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Agent,Admin")]   // reports are management-facing
public class ReportsController : ControllerBase
{
    private readonly HelpdeskDbContext _db;
    public ReportsController(HelpdeskDbContext db) => _db = db;

    [HttpGet("summary")]
    public async Task<ActionResult<ReportSummary>> GetSummary(
        [FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        // Default to last 30 days if no range given.
        var start = from ?? DateTime.UtcNow.AddDays(-30);
        var end = (to ?? DateTime.UtcNow).Date.AddDays(1).AddTicks(-1); // include all of 'to' day

        // Pull tickets in range once, aggregate in memory (fine for prototype volumes).
        var tickets = await _db.Tickets
            .Where(t => t.CreatedAt >= start && t.CreatedAt <= end)
            .Select(t => new
            {
                t.CreatedAt, t.ClosedAt, t.Status, t.Priority,
                CategoryName = t.Category!.Name,
                AgentName = t.AssignedAgent != null ? t.AssignedAgent.DisplayName : null
            })
            .ToListAsync();

        // Volume over time — group by day
        var volume = tickets
            .GroupBy(t => t.CreatedAt.Date)
            .OrderBy(g => g.Key)
            .Select(g => new TimeSeriesPoint { Period = g.Key.ToString("yyyy-MM-dd"), Count = g.Count() })
            .ToList();

        // Category trends
        var categories = tickets
            .GroupBy(t => t.CategoryName)
            .Select(g => new CategoryStat { Category = g.Key ?? "Uncategorized", Count = g.Count() })
            .OrderByDescending(c => c.Count)
            .ToList();

        // Agent performance — assigned vs resolved
        var agents = tickets
            .Where(t => t.AgentName != null)
            .GroupBy(t => t.AgentName!)
            .Select(g => new AgentStat
            {
                AgentName = g.Key,
                Assigned = g.Count(),
                Resolved = g.Count(t => t.Status == TicketStatus.Resolved || t.Status == TicketStatus.Closed)
            })
            .OrderByDescending(a => a.Assigned)
            .ToList();

        // Resolution time — avg days to close for closed tickets
        var closed = tickets
            .Where(t => t.ClosedAt != null)
            .Select(t => (t.ClosedAt!.Value - t.CreatedAt).TotalDays)
            .ToList();
        var avgDays = closed.Count > 0 ? Math.Round(closed.Average(), 1) : 0;

        return Ok(new ReportSummary
        {
            TotalTickets = tickets.Count,
            OpenTickets = tickets.Count(t => t.Status != TicketStatus.Resolved && t.Status != TicketStatus.Closed),
            ResolvedTickets = tickets.Count(t => t.Status == TicketStatus.Resolved || t.Status == TicketStatus.Closed),
            AvgDaysToClose = avgDays,
            VolumeOverTime = volume,
            AgentPerformance = agents,
            CategoryTrends = categories
        });
    }
}