namespace HelpdeskApi.Models;

using System.ComponentModel;
using System.Reflection.Metadata;
using System.Runtime;
using HelpdeskApi.Models.Enums;

public class Ticket
{
    public int Id {get;set;}
    public string Title {get;set;} = string.Empty;
    public string Description {get;set;} = string.Empty;

    public int RequesterId {get;set;}
    public User? Requester {get;set;}

    public int? AssignedAgentId {get;set;}
    public User? AssignedAgent {get;set;}

    public int CategoryId {get;set;}
    public Category? Category {get;set;}

    public int? AssetId {get;set;}
    public Asset? Asset {get;set;}

    public TicketPriority Priority {get;set;} = TicketPriority.Medium;
    public TicketStatus Status {get;set;} = TicketStatus.New;

    public DateTime CreatedAt {get;set;} = DateTime.UtcNow;
    public DateTime UpdatedAt {get;set;} = DateTime.UtcNow;
    public DateTime? ClosedAt {get;set;}

    public ICollection<TicketComment> Comments {get;set;} = new List<TicketComment>();
}