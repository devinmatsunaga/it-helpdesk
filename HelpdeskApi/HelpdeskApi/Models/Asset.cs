namespace HelpdeskApi.Models;
using HelpdeskApi.Models.Enums;

public class Asset
{
    public int Id {get;set;}
    public string? AssetTag {get;set;} = String.Empty;
    public string Name {get;set;} = string.Empty;
    public string? SerialNumber {get;set;}
    public bool IsActive {get;set;} = true;

    public ICollection<Ticket> Tickets {get;set;} = new List<Ticket>();
}