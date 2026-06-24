using HelpdeskApi.Models;
using HelpdeskApi.DTOs;

namespace HelpdeskApi.Services;

public interface ITicketService
{
    Task<List<TicketResponse>> GetAllAsync();
    Task<TicketResponse?> GetByIdAsync(int id);
    Task<TicketResponse> CreateAsync(CreateTicketRequest request);
    Task<TicketResponse?> UpdateAsync(int id, UpdateTicketRequest request);
    Task<List<CommentResponse>> GetCommentsAsync(int ticketId);
    Task<CommentResponse> AddCommentAsync(int ticketId, CreateCommentResponse request);
}