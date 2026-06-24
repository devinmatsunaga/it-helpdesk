using HelpdeskApi.Data;
using HelpdeskApi.Models;
using HelpdeskApi.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace HelpdeskApi.Services;

public class UserProvisioningService : IUserProvisioningService
{
    private readonly HelpdeskDbContext _db;
    public UserProvisioningService(HelpdeskDbContext db) => _db = db;

    public async Task<User> FindOrCreateAsync(AdUser adUser)
    {
        var existing = await _db.Users
            .FirstOrDefaultAsync(u => u.AdObjectId == adUser.Username);

        var role = ParseRole(adUser.Role);

        if (existing is not null)
        {
            existing.DisplayName = adUser.DisplayName;
            existing.Email = adUser.Email;
            existing.Role = role;
            existing.IsActive = true;
            await _db.SaveChangesAsync();
            return existing;
        }
        
        var created = new User
        {
            AdObjectId = adUser.Username,
            DisplayName = adUser.DisplayName,
            Email = adUser.Email,
            Role = role,
            IsActive = true
        };
        _db.Users.Add(created);
        await _db.SaveChangesAsync();
        return created;
    }

    private static UserRole ParseRole(string role) => role switch
    {
        "Admin" => UserRole.Admin,
        "Agent" => UserRole.Agent,
        _ => UserRole.Requester
    };
}