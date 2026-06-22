namespace HelpdeskApi.Models;
using HelpdeskApi.Models.Enums;

// "?" OPTIONAL FIELD

public class User
{
    public int Id {get; set;}
    public string? AdObjectId {get; set;}
    public string DisplayName {get; set;} = string.Empty;
    public string Email {get;set;} = string.Empty;
    public UserRole Role {get;set;} = UserRole.Requester;
    public bool IsActive {get;set;} = true;
    public DateTime CreatedAt {get;set;} = DateTime.UtcNow;

    //Navigation Properties
    public ICollection<Ticket> RequestedTickets {get;set;} = new List<Ticket>();
    public ICollection<Ticket> AssignedTickets {get;set;} = new List<Ticket>();
}