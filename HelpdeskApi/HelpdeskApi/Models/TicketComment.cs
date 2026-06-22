namespace HelpdeskApi.Models;
using HelpdeskApi.Models.Enums;

public class TicketComment
{
    public int Id {get;set;}
    public int TicketId {get;set;}
    public Ticket? Ticket {get;set;}

    public int AuthorId {get;set;}
    public User? Author {get;set;}

    public string Body {get;set;} = string.Empty;

    public bool IsInternal {get;set;}

    public DateTime CreatedAt {get;set;} = DateTime.UtcNow;
}