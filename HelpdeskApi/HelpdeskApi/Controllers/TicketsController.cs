using HelpdeskApiApi.DTOs;
using HelpdeskApi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using HelpdeskApi.Models;

namespace HelpdeskApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TicketsController : ControllerBase
{
    private readonly ITicketService _service;
    public TicketsController(ITicketService service) => _service = service;

    [HttpGet] // GET ALL TICKETS
    public async Task<ActionResult<TicketResponse>> GetById(int id)
    {
        var ticket = await _service.GetByIdAsync(id);
        return ticket is null ? NotFound() :Ok(ticket);
    }

    [HttpPost] // CREATE TICKET
    public async Task<ActionResult<TicketResponse>> Create(CreateTicketRequest request)
    {
       var created = await _service.CreateAsync(request);
       return CreatedAtAction(nameof(GetById), new {id = created.Id}, created); 
    }

    [HttpPut] // UPDATE TICKET
    public async Task<ActionResult<TicketResponse>> Update(int id,UpdateTicketRequest request)
    {
        var updated = await _service.UpdateAsync(id, request);
        return updated is null ? NotFound() : Ok(updated);
    }
}