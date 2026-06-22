using HelpdeskApi.Data;
using HelpdeskApiApi.DTOs;
using HelpdeskApi.Models;
using Microsoft.EntityFrameworkCore;

namespace HelpdeskApi.Services;

public class TicketService : ITicketService
{
    private readonly HelpdeskDbContext _db;
    public TicketService(HelpdeskDbContext db) => _db = db;

    public async Task<List<TicketResponse>> GetAllAsync()
    {
        return await _db.Tickets
            .Include(t => t.Requester)
            .Include(t => t.AssignedAgent)
            .Include(t => t.Category)
            .Include(t => t.Asset)
            .Select(t => MapToResponse(t))
            .ToListAsync();
    }

    public async Task<TicketResponse?> GetByIdAsync (int id)
    {
        var t = await _db.Tickets
            .Include(t => t.Requester)
            .Include(t => t.AssignedAgent)
            .Include(t => t.Category)
            .Include(t => t.Asset)
            .FirstOrDefaultAsync(t => t.Id == id);
        return t is null ? null : MapToResponse(t);
    }

    public async Task<TicketResponse> CreateAsync(CreateTicketRequest request)
    {
        var ticket = new Ticket
        {
            Title = request.Title,
            Description = request.Description,
            RequesterId = request.RequesterId,
            CategoryId = request.CategoryId,
            AssetId = request.AssetId,
            Priority = request.Priority,
            Status = Models.Enums.TicketStatus.New
        };
        _db.Tickets.Add(ticket);
        await _db.SaveChangesAsync();
        return (await GetByIdAsync(ticket.Id))!;
    }

    public async Task<TicketResponse?> UpdateAsync(int id, UpdateTicketRequest request)
    {
        var ticket = await _db.Tickets.FirstOrDefaultAsync(t => t.Id == id);
        if (ticket is null) return null;

        ticket.AssignedAgentId = request.AssignedAgentId;
        ticket.Status = request.Status;
        ticket.Priority = request.Priority;
        ticket.UpdatedAt = DateTime.UtcNow;
        if (request.Status == Models.Enums.TicketStatus.Closed && ticket.ClosedAt is null)
            ticket.ClosedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    private static TicketResponse MapToResponse(Ticket t) => new()
    {
        Id = t.Id,
        Title = t.Title,
        Description = t.Description,
        RequesterName = t.Requester?.DisplayName ?? "",
        AssignedAgentName = t.AssignedAgent?.DisplayName,
        CategoryName = t.Category?.Name ?? "",
        AssetTag = t.Asset?.AssetTag,
        Priority = t.Priority,
        Status = t.Status,
        CreatedAt = t.CreatedAt
    };
}