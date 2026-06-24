using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.DirectoryServices.AccountManagement;
using HelpdeskApi.Models;

namespace HelpdeskApi.Services;

public record AdUser(string Username, string DisplayName, string Email, string Role);

public interface IAdAuthService
{
    AdUser? Validate(string username, string password);
}

public class AdAuthService: IAdAuthService
{
    private readonly IConfiguration _config;
    public AdAuthService(IConfiguration config) => _config = config;

    public AdUser? Validate(string username, string password)
{
    var server = _config["ActiveDirectory:Server"]!;
    var container = _config["ActiveDirectory:Container"]!;
    var svcUser = _config["ActiveDirectory:ServiceUser"]!;
    var svcPass = _config["ActiveDirectory:ServicePassword"]!;
    var agentGroup = _config["ActiveDirectory:AgentGroup"]!;
    var adminGroup = _config["ActiveDirectory:AdminGroup"]!;

    try
    {
        using (var validateCtx = new PrincipalContext(ContextType.Domain, server, container))
        {
            if (!validateCtx.ValidateCredentials(username, password))
            {
                Console.WriteLine($"VALIDATE FAILED for {username}");
                return null;
            }
        }
        Console.WriteLine($"VALIDATE OK for {username}, looking up groups...");

        using var ctx = new PrincipalContext(ContextType.Domain, server, container, svcUser, svcPass);

        using var user = UserPrincipal.FindByIdentity(ctx, IdentityType.SamAccountName, username);
        if (user is null)
        {
            Console.WriteLine($"USER NOT FOUND: {username}");
            return null;
        }

        var groups = user.GetGroups()
            .Where(g => g.Name != null)
            .Select(g => g.Name!)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var role = groups.Contains(adminGroup) ? "Admin"
                 : groups.Contains(agentGroup) ? "Agent"
                 : "Requester";

        return new AdUser(
            Username: user.SamAccountName ?? username,
            DisplayName: user.DisplayName ?? username,
            Email: user.EmailAddress ?? "",
            Role: role
        );
     }
    catch (Exception ex)
        {
        Console.WriteLine($"AD AUTH ERROR: {ex.Message}");
        Console.WriteLine(ex.ToString());
        return null;
        }
    }
}      