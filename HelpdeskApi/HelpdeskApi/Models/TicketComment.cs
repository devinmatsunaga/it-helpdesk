namespace HelpdeskApi.Models;
using HelpdeskApi.Models.Enums;

public class TicketComment
{
    public int Id {get;set;}
    public int TicketId {get;set;}

    public int UserId {get;set;}
    public User? User {get;set;}

    public string Comment {get;set;} = String.Empty;

    public DateTime CreatedAt {get;set;} = DateTime.UtcNow;
}