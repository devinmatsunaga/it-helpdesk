using HelpdeskApi.Models;
using HelpdeskApiApi.DTOs;

namespace HelpdeskApi.Services;

public interface ITicketService
{
    Task<List<TicketResponse>> GetAllAsync();
    Task<TicketResponse?> GetByIdAsync(int id);
    Task<TicketResponse> CreateAsync(CreateTicketRequest request);
    Task<TicketResponse?> UpdateAsync(int id, UpdateTicketRequest request);
}