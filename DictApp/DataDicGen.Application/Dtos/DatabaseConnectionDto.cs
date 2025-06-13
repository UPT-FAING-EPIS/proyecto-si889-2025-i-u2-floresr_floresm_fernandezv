public class DatabaseConnectionDto
{
    public string Server { get; set; }         // Ej: sqlserver.ejemplo.com
    public string Database { get; set; }       // Ej: MiBaseDatos
    public string User { get; set; }           // Ej: admin_user
    public string Password { get; set; }       // Contraseña
    public int? Port { get; set; }             // Puerto personalizado (opcional)
    public string? AuthSource { get; set; } = "admin"; // Para MongoDB
}