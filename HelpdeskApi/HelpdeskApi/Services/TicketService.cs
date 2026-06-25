using HelpdeskApi.Data;
using HelpdeskApi.DTOs;
using HelpdeskApi.Models;
using Microsoft.EntityFrameworkCore;

namespace HelpdeskApi.Services;

public class TicketService : ITicketService
{
    private readonly HelpdeskDbContext _db;
    public TicketService(HelpdeskDbContext db) => _db = db;

    public async Task<List<TicketResponse>> GetAllAsync(bool unassignedOnly = false)
    {
    var query = _db.Tickets
        .Include(t => t.Requester).Include(t => t.AssignedAgent)
        .Include(t => t.Category).Include(t => t.Asset)
        .AsQueryable();

    if (unassignedOnly)
        query = query.Where(t => t.AssignedAgentId == null);

    return await query
        .OrderByDescending(t => t.CreatedAt)
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
        AssignedAgentId = t.AssignedAgentId,
        CategoryName = t.Category?.Name ?? "",
        AssetTag = t.Asset?.AssetTag,
        Priority = t.Priority,
        Status = t.Status,
        CreatedAt = t.CreatedAt
    };

    public async Task<List<CommentResponse>> GetCommentsAsync(int ticketId)
    {
        return await _db.TicketComments
            .Where(c => c.TicketId == ticketId)
            .Include(c => c.Author)
            .OrderBy(c => c.CreatedAt)
            .Select(c => new CommentResponse
            {
                Id = c.Id,
                AuthorName = c.Author!.DisplayName,
                Body = c.Body,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<CommentResponse> AddCommentAsync(int ticketId, CreateCommentResponse request)
    {
        var ticketExists = await _db.Tickets.AnyAsync(t => t.Id == ticketId);
        if(!ticketExists) return null;

        var comment = new Models.TicketComment
        {
            TicketId = ticketId,
            AuthorId = request.AuthorId,
            Body = request.Body,
            IsInternal = request.IsInternal,
        };
        _db.TicketComments.Add(comment);
        await _db.SaveChangesAsync();

        return await _db.TicketComments
            .Where(c => c.Id == comment.Id)
            .Include(c => c.Author)
            .Select(c => new CommentResponse
            {
                Id = c.Id,
                AuthorName = c.Author.DisplayName,
                Body = c.Body,
                IsInternal = c.IsInternal,
                CreatedAt = c.CreatedAt
            })
        .FirstAsync();
    }

    public async Task<List<TicketResponse>> GetMyTicketsAsync(int userId)
    {
        return await _db.Tickets
            .Include(t => t.Requester)
            .Include(t => t.AssignedAgent)
            .Include(t => t.Category)
            .Include(t => t.Asset)
            .Where(t => t.RequesterId == userId || t.AssignedAgentId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => MapToResponse(t))
            .ToListAsync();
    }

    public async Task<TicketResponse?> AssignAsync(int ticketId, int? agentId)
    {
        var ticket = await _db.Tickets.FirstOrDefaultAsync(t => t.Id == ticketId);
        if (ticket is null) return null;

        ticket.AssignedAgentId = agentId;
        ticket.UpdatedAt = DateTime.UtcNow;

        if (agentId is not null && ticket.Status == Models.Enums.TicketStatus.New)
            ticket.Status = Models.Enums.TicketStatus.Open;

        await _db.SaveChangesAsync();
        return await GetByIdAsync(ticketId);
    }
}