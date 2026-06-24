using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HelpdeskApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.IdentityModel.Tokens;

namespace HelpdeskApi.Controllers;

public record LoginRequest(string Username, string Password);
public record LoginResponse(string Token, string DisplayName, string Role, string Username, int UserId);

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]

public class AuthController : ControllerBase
{
    private readonly IAdAuthService _ad;
    private readonly IUserProvisioningService _provisioning;
    private readonly IConfiguration _config;
    public AuthController(IAdAuthService ad,IUserProvisioningService provisioning , IConfiguration config)
    {
        _ad = ad;
        _provisioning = provisioning;
        _config = config;
    }

    [HttpPost("Login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
    {
        var aduser = _ad.Validate(request.Username, request.Password);
        if (aduser is null)
            return Unauthorized(new {message = "Invalid username or password"});

        var localuser = await _provisioning.FindOrCreateAsync(aduser);
        
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, localuser.Id.ToString()),
            new Claim(ClaimTypes.Name, aduser.Username),
            new Claim("displayname", aduser.DisplayName),
            new Claim(ClaimTypes.Role, aduser.Role)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var hours = int.Parse(_config["Jwt:ExpiryHours"] ?? "8");

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(hours),
            signingCredentials: creds
        );

        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
        return Ok(new LoginResponse(tokenString, aduser.DisplayName, aduser.Role, aduser.Username, localuser.Id));
    }
}