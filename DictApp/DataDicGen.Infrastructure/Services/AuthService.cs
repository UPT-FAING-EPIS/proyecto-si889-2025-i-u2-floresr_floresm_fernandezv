using DataDicGen.Application.Interfaces.Services;
using DataDicGen.Domain.Entities;
using DataDicGen.Infrastructure.Persistence;

namespace DataDicGen.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;

    public AuthService(AppDbContext context)
    {
        _context = context;
    }

    public bool ValidateUser(string username, string password)
    {
        var user = _context.Users.FirstOrDefault(u => u.Username == username && u.Password == password);
        return user != null;
    }
}