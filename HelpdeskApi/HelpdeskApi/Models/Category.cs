namespace HelpdeskApi.Models;
using HelpdeskApi.Models.Enums;

public class Category
{
    public int Id {get;set;}
    public string Name {get;set;} = string.Empty;
    public string? IsActive {get;set;}

    public ICollection<Ticket> Tickets {get;set;} = new List<Ticket>();
}