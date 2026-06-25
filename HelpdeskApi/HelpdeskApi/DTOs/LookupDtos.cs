using HelpdeskApi.Models.Enums;

namespace HelpdeskApi.DTOs;

public class CategoryResponse
{
    public int Id {get;set;}
    public string Name {get;set;} = string.Empty;
}

public class UserResponse
{
    public int Id {get;set;}
    public string DisplayName {get;set;} = string.Empty;
    public string Email {get;set;} = string.Empty;
    public UserRole Role {get;set;}
}

public class AssetResponse
{
    public int Id {get;set;}
    public string AssetTag {get;set;} = string.Empty;
    public string Name {get;set;} = string.Empty;
    public string? Type {get;set;}
    public string? Location {get;set;}
    public bool IsActive {get;set;}
    public string? AssignedToName {get;set;}
}

public class AssetDetailResponse
{
    public int Id { get; set; }
    public string AssetTag { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Type { get; set; }
    public string? Location { get; set; }
    public string? SerialNumber { get; set; }
    public DateTime? PurchaseDate { get; set; }
    public DateTime? WarrantyExpiry { get; set; }
    public int? AssignedToUserId { get; set; }
    public string? AssignedToName { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<AssetTicketItem> Tickets { get; set; } = new();
}

public class AssetTicketItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public TicketStatus Status { get; set; }
    public TicketPriority Priority { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateAssetRequest
{
    public string AssetTag { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Type { get; set; }
    public string? Location { get; set; }
    public string? SerialNumber { get; set; }
    public DateTime? PurchaseDate { get; set; }
    public DateTime? WarrantyExpiry { get; set; }
    public int? AssignedToUserId { get; set; }
}

public class UpdateAssetRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Type { get; set; }
    public string? Location { get; set; }
    public string? SerialNumber { get; set; }
    public DateTime? PurchaseDate { get; set; }
    public DateTime? WarrantyExpiry { get; set; }
    public int? AssignedToUserId { get; set; }
}
