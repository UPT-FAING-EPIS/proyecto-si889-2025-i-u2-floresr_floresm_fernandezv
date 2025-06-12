using DataDicGen.Domain.Entities;

namespace DataDicGen.Application.Interfaces.Services;

public interface IAuthService
{
    bool ValidateUser(string username, string password);
}