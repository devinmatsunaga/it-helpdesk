namespace HelpdeskApi.Models;
using HelpdeskApi.Models.Enums;

public class Asset
{
    public int Id {get;set;}
    public string? AssetTag {get;set;} = String.Empty;
    public string Name {get;set;} = string.Empty;
    public string? Type {get;set;}
    public string? Location {get;set;}
    public string? QrCodePayload {get;set;}
    public bool IsActive {get;set;} = true;
    public DateTime CreatedAt {get;set;} = DateTime.UtcNow;

    public string? SerialNumber {get;set;}
    public DateTime? PurchaseDate {get;set;}
    public DateTime? WarrantyExpiry {get;set;}
    public int? AssignedToUserId {get;set;}
    public User? AssignedToUser {get;set;}

    public ICollection<Ticket> Tickets {get;set;} = new List<Ticket>();
}