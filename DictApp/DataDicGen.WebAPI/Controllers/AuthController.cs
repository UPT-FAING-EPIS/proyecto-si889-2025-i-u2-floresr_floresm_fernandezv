using Microsoft.AspNetCore.Mvc;
using DataDicGen.Application.Interfaces.Services;

namespace DataDicGen.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        if (_authService.ValidateUser(request.Username, request.Password))
            return Ok(new { message = "Login exitoso" });

        return Unauthorized(new { message = "Credenciales inválidas" });
    }
}

public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
