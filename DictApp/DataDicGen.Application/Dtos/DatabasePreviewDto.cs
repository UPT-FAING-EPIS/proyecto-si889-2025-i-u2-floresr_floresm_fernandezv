namespace DataDicGen.Application.Dtos;

public class DatabasePreviewDto
{
    public List<TableSchemaDto> Tables { get; set; } = new();
    public DocumentMetadataDto Metadata { get; set; } = new();
}