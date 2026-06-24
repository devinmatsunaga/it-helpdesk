using HelpdeskApi.Models;
using HelpdeskApi.Models.Enums;

namespace HelpdeskApi.DTOs;

public class TicketResponse // SENT BACK TO CLIENT WHEN LISTING/READING TICKETS
{
    public int Id {get;set;}
    public string Title {get;set;} = string.Empty;
    public string Description {get;set;} = string.Empty;
    public string RequesterName {get;set;} = string.Empty;
    public string? AssignedAgentName {get;set;}
    public string CategoryName {get;set;} = string.Empty;
    public string? AssetTag {get;set;} 
    public TicketPriority Priority {get;set;}
    public TicketStatus Status {get;set;}
    public DateTime CreatedAt {get;set;}
}

public class CreateTicketRequest // CLIENT REQUEST TO CREATE TICKET
{
    public string Title {get;set;} = string.Empty;
    public string Description {get;set;} = string.Empty;
    public int RequesterId {get;set;}
    public int CategoryId {get;set;}
    public int? AssetId {get;set;}
    public TicketPriority Priority {get;set;} = TicketPriority.Medium;
}

public class UpdateTicketRequest // CLIENT REQUEST TO UPDATE TICKET STATUS
{
    public int? AssignedAgentId {get;set;}
    public TicketStatus Status {get;set;}
    public TicketPriority Priority {get;set;}
}