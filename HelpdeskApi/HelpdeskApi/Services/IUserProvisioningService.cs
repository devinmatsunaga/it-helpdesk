using HelpdeskApi.Models;
using HelpdeskApi.Models.Enums;

namespace HelpdeskApi.Services;

public interface IUserProvisioningService
{
    Task<User> FindOrCreateAsync(AdUser adUser);
}