using HelpdeskApi.DTOs;
using HelpdeskApi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using HelpdeskApi.Models;
using Microsoft.AspNetCore.Authorization;

namespace HelpdeskApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TicketsController : ControllerBase
{
    private readonly ITicketService _service;
    public TicketsController(ITicketService service) => _service = service;

    [HttpGet] // GET ALL TICKETS
    public async Task<ActionResult<TicketResponse>> GetAll()
        => Ok(await _service.GetAllAsync());

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

    [HttpGet("{id:int}/comments")] // RETRIEVE COMMENTS
    public async Task<ActionResult<List<CommentResponse>>> GetComments (int id)
        => Ok(await _service.GetCommentsAsync(id));

    [HttpPost("{id:int}/comments")] // CREATE COMMENT
    public async Task<ActionResult<CommentResponse>> AddComment(int id, CreateCommentResponse request)
    {
        var created = await _service.AddCommentAsync(id, request);
        return created is null ? NotFound() : Ok(created);
    }
}