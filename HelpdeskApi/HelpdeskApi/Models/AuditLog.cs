namespace HelpdeskApi.Models;

using System.Reflection.Metadata;
using HelpdeskApi.Models.Enums;

public class AuditLog
{
    public int Id {get;set;}
    
    public int UserId {get;set;}
    public User? User {get;set;}

    public string Action {get;set;} = String.Empty;
    public string EntityName {get;set;} = String.Empty;
    public int EntityId {get;set;}
    public DateTime CreatedAt {get;set;} = DateTime.UtcNow;
}