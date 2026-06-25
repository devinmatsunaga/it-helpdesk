using HelpdeskApi.DTOs;
using HelpdeskApi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using HelpdeskApi.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace HelpdeskApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TicketsController : ControllerBase
{
    private readonly ITicketService _service;
    public TicketsController(ITicketService service) => _service = service;

    [HttpGet] // GET ALL TICKETS
    public async Task<ActionResult<List<TicketResponse>>> GetAll([FromQuery] bool unassignedOnly = false)
        => Ok(await _service.GetAllAsync(unassignedOnly));

    [HttpGet("{id:int}")] // VIEW SPECIFIC TICKET
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

    [HttpPut("{id:int}")] // UPDATE TICKET
    public async Task<ActionResult<TicketResponse>> Update(int id,UpdateTicketRequest request)
    {
        var updated = await _service.UpdateAsync(id, request);
        return updated is null ? NotFound() : Ok(updated);
    }
    
    public record AssignTicketRequest(int? AssignedAgentId);
    [HttpPut("{id:int}/assign")]
    [Authorize(Roles = "Agent,Admin")]
    public async Task<ActionResult<TicketResponse>> Assign(int id, AssignTicketRequest request)
    {
      var result = await _service.AssignAsync(id, request.AssignedAgentId);
      return result is null ? NotFound() : Ok(result);  
    }

    [HttpPut("{id:int}/assign-to-me")]
    [Authorize(Roles = "Agent,Admin")]
    public async Task<ActionResult<TicketResponse>> AssignToMe(int id)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !int.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var result = await _service.AssignAsync(id, userId);
        return result is null ? NotFound() :Ok(result);
    }

    [HttpGet("{id:int}/comments")] // RETRIEVE COMMENTS
    public async Task<ActionResult<List<CommentResponse>>> GetComments (int id)
        => Ok(await _service.GetCommentsAsync(id));

    [HttpPost("{id:int}/comments")] // CREATE COMMENT
    public async Task<ActionResult<CommentResponse>> AddComment(int id, CreateCommentResponse request)
    {
        var created = await _service.AddCommentAsync(id, request);
        return created is null ? NotFound() : Ok(created);
    }

    [HttpGet("mine")] // RETRIEVE TICKETS BASED ON CURRENT LOGGED IN USER
    public async Task<ActionResult<List<TicketResponse>>> GetMine()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !int.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        return Ok(await _service.GetMyTicketsAsync(userId));
    }
}