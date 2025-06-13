using Microsoft.AspNetCore.Mvc;
using DataDicGen.Application.Dtos;
using DataDicGen.Application.Interfaces.Services;
using DataDicGen.Infrastructure.Services;

namespace DataDicGen.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MetadataController : ControllerBase
{    private readonly IDatabaseMetadataService _metadataService;
    private readonly IDocumentGenerator _documentGenerator;
    private readonly ICredentialsCacheService _credentialsCache;
    private readonly RedisDatabaseMetadataService _redisService;
    private readonly CassandraDatabaseMetadataService _cassandraService;

    public MetadataController(
        IDatabaseMetadataService metadataService,
        IDocumentGenerator documentGenerator,
        ICredentialsCacheService credentialsCache,
        RedisDatabaseMetadataService redisService,
        CassandraDatabaseMetadataService cassandraService)
    {
        _metadataService = metadataService;
        _documentGenerator = documentGenerator;
        _credentialsCache = credentialsCache;
        _redisService = redisService;
        _cassandraService = cassandraService;
    }

    /// <summary>
    /// Conecta a la base de datos y guarda las credenciales para uso posterior
    /// </summary>
    [HttpPost("connect")]
    public async Task<ActionResult<ConnectionResponseDto>> Connect([FromBody] DatabaseConnectionDto dto)
    {
        try
        {
            // Verificar la conexión obteniendo los metadatos
            var tablas = await _metadataService.ObtenerDiccionarioAsync(dto);

            if (tablas == null || !tablas.Any())
            {
                return NotFound(new ConnectionResponseDto
                {
                    Message = "No se encontraron tablas en la base de datos."
                });
            }

            // Almacenar credenciales y generar token
            string token = _credentialsCache.StoreCredentials(dto);

            return Ok(new ConnectionResponseDto
            {
                Token = token,
                Message = $"Conexión exitosa. Se encontraron {tablas.Count} tablas."
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ConnectionResponseDto
            {
                Message = $"Error al conectar: {ex.Message}"
            });
        }
    }

    /// <summary>
    /// Descarga el diccionario de datos en formato PDF usando credenciales almacenadas
    /// </summary>
    [HttpGet("diccionario/pdf/{token}")]
    public async Task<IActionResult> DescargarDiccionarioPorToken(string token)
    {
        try
        {
            // Validar el token
            if (!_credentialsCache.HasToken(token))
                return BadRequest("Token inválido o expirado. Por favor, vuelva a conectarse.");

            // Obtener credenciales
            var credentials = _credentialsCache.GetCredentials(token);

            // Generar el PDF
            var tablas = await _metadataService.ObtenerDiccionarioAsync(credentials);
            var pdfBytes = _documentGenerator.GenerarDiccionarioPdf(tablas);

            return File(pdfBytes, "application/pdf", "diccionario_datos.pdf");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error al generar el PDF: {ex.Message}");
        }
    }

    /// <summary>
    /// Método original que requiere las credenciales en cada llamada
    /// </summary>
    [HttpPost("diccionario/pdf")]
    public async Task<IActionResult> DescargarDiccionario([FromBody] DatabaseConnectionDto dto)
    {
        try
        {
            var tablas = await _metadataService.ObtenerDiccionarioAsync(dto);
            var pdfBytes = _documentGenerator.GenerarDiccionarioPdf(tablas);

            return File(pdfBytes, "application/pdf", "diccionario_datos.pdf");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error al generar el PDF: {ex.Message}");
        }
    }
    /// <summary>
    /// Genera vista previa editable del diccionario
    /// </summary>
    [HttpPost("generate-preview")]
    public async Task<ActionResult<DatabasePreviewDto>> GeneratePreview([FromBody] DatabaseConnectionDto dto)
    {
        try
        {
            // Obtenemos el esquema básico usando el servicio existente
            var tablas = await _metadataService.ObtenerDiccionarioAsync(dto);

            var preview = new DatabasePreviewDto
            {
                Tables = tablas,
                Metadata = new DocumentMetadataDto()
            };

            return Ok(preview);
        }
        catch (Exception ex)
        {
            return BadRequest($"Error generando preview: {ex.Message}");
        }
    }
     /// <summary>
    /// Exporta PDF con datos editados del preview
    /// </summary>
    [HttpPost("export-pdf")]
    public async Task<IActionResult> ExportPdf([FromBody] DatabasePreviewDto previewData)
    {
        try
        {
            // Generar PDF con los datos editados de forma asíncrona
            var pdfBytes = await Task.Run(() => _documentGenerator.GenerarDiccionarioPdf(previewData.Tables));
            
            return File(pdfBytes, "application/pdf", "diccionario-datos-editado.pdf");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error al exportar PDF: {ex.Message}");
        }
    }
    /// <summary>
    /// Obtiene el diccionario de datos de MySQL
    /// </summary>
    [HttpPost("mysql/diccionario")]
    public async Task<IActionResult> ObtenerDiccionarioMySql([FromBody] DatabaseConnectionDto dto, [FromServices] IOpenAIService openAIService)
    {
        try
        {
            var mysqlService = new MySqlDatabaseMetadataService(openAIService);
            var tablas = await mysqlService.ObtenerDiccionarioAsync(dto);
            return Ok(tablas);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error al obtener el diccionario de datos MySQL: {ex.Message}");
        }
    }

    /// <summary>
    /// Genera vista previa editable del diccionario para MySQL
    /// </summary>
    [HttpPost("mysql/generate-preview")]
    public async Task<ActionResult<DatabasePreviewDto>> GeneratePreviewMySql([FromBody] DatabaseConnectionDto dto, [FromServices] IOpenAIService openAIService)
    {
        try
        {
            var mysqlService = new MySqlDatabaseMetadataService(openAIService);
            var tablas = await mysqlService.ObtenerDiccionarioAsync(dto);
            var preview = new DatabasePreviewDto
            {
                Tables = tablas,
                Metadata = new DocumentMetadataDto()
            };
            return Ok(preview);
        }
        catch (Exception ex)
        {
            return BadRequest($"Error generando preview MySQL: {ex.Message}");
        }
    }
    /// <summary>
    /// Genera vista previa editable del diccionario para PostgreSQL
    /// </summary>
    [HttpPost("postgres/generate-preview")]
    public async Task<ActionResult<DatabasePreviewDto>> GeneratePreviewPostgres([FromBody] DatabaseConnectionDto dto, [FromServices] IOpenAIService openAIService)
    {
        try
        {
            var pgService = new PostgresDatabaseMetadataService(openAIService);
            var tablas = await pgService.ObtenerDiccionarioAsync(dto);
            var preview = new DatabasePreviewDto
            {
                Tables = tablas,
                Metadata = new DocumentMetadataDto()
            };
            return Ok(preview);
        }
        catch (Exception ex)
        {
            return BadRequest($"Error generando preview PostgreSQL: {ex.Message}");
        }
    }
    /// <summary>
    /// Genera vista previa editable del diccionario para MongoDB
    /// </summary>
    [HttpPost("mongo/generate-preview")]
    public async Task<ActionResult<DatabasePreviewDto>> GeneratePreviewMongo([FromBody] DatabaseConnectionDto dto, [FromServices] IOpenAIService openAIService)
    {
        try
        {
            var mongoService = new MongoDatabaseMetadataService(openAIService);
            var tablas = await mongoService.ObtenerDiccionarioAsync(dto);
            var preview = new DatabasePreviewDto
            {
                Tables = tablas,
                Metadata = new DocumentMetadataDto()
            };
            return Ok(preview);
        }
        catch (Exception ex)
        {
            return BadRequest($"Error generando preview MongoDB: {ex.Message}");
        }
    }    /// <summary>
    /// Genera vista previa editable del diccionario para Redis
    /// </summary>
    [HttpPost("redis/generate-preview")]
    public async Task<ActionResult<DatabasePreviewDto>> GeneratePreviewRedis([FromBody] DatabaseConnectionDto dto)
    {
        try
        {
            var preview = await _redisService.GeneratePreviewAsync(dto);
            return Ok(preview);
        }
        catch (Exception ex)
        {
            return BadRequest($"Error generando preview Redis: {ex.Message}");
        }
    }    /// <summary>
    /// Genera vista previa editable del diccionario para Cassandra
    /// </summary>
    [HttpPost("cassandra/generate-preview")]
    public async Task<ActionResult<DatabasePreviewDto>> GeneratePreviewCassandra([FromBody] DatabaseConnectionDto dto)
    {
        try
        {
            var preview = await _cassandraService.GeneratePreviewAsync(dto);
            return Ok(preview);
        }
        catch (Exception ex)
        {
            return BadRequest($"Error generando preview Cassandra: {ex.Message}");
        }
    }
}
