namespace HelpdeskApi.Models;

using System.Reflection.Metadata;
using HelpdeskApi.Models.Enums;

public class AuditLog
{
    public int Id {get;set;}
    public string EntityName {get;set;} = String.Empty;
    public int EntityId {get;set;}
    public string Action {get;set;} = String.Empty;
    public int? ChangedById {get;set;}
    public User? ChangedBy { get; set; }
    public DateTime ChangedAt {get;set;} = DateTime.UtcNow;
    public string? Notes {get;set;}
}