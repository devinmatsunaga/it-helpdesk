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
    public string? Location {get;set;}
}

