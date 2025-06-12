// Infrastructure/Services/DocumentGenerator.cs

using DataDicGen.Application.Interfaces.Services;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System.IO;

namespace DataDicGen.Infrastructure.Services;
public class DocumentGenerator : IDocumentGenerator
{
    public byte[] GenerarDiccionarioPdf(List<TableSchemaDto> tablas)
    {
        var document = QuestPDF.Fluent.Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(30);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Content().Column(col =>
                {
                    foreach (var tabla in tablas)
                    {
                        // Sección de información general de la tabla
                        col.Item().Table(t =>
                        {
                            t.ColumnsDefinition(c =>
                            {
                                c.ConstantColumn(180);
                                c.RelativeColumn();
                            });

                            t.Cell().Border(1).Padding(5).Text("Nombre de la Tabla:").SemiBold();
                            t.Cell().Border(1).Padding(5).Text("dbo." + tabla.TableName);

                            t.Cell().Border(1).Padding(5).Text("Descripción de la Tabla:");
                            t.Cell().Border(1).Padding(5).Text(tabla.TableDescription ?? "");

                            t.Cell().Border(1).Padding(5).Text("Objetivo:");
                            t.Cell().Border(1).Padding(5).Text(tabla.TablePurpose ?? "");

                            t.Cell().Border(1).Padding(5).Text("Relaciones con otras tablas:");
                            t.Cell().Border(1).Padding(5).Text(text =>
                            {
                                var relaciones = tabla.TableRelationships?.Split(", ");
                                if (relaciones != null && relaciones.Any())
                                {
                                    foreach (var r in relaciones)
                                        text.Line(r);
                                }
                                else
                                {
                                    text.Line("Sin relaciones detectadas.");
                                }
                            });

                            t.Cell().Border(1).Padding(5).Text("Descripción de los campos").SemiBold().FontSize(11);
                            t.Cell().Border(1).Padding(5).Text("");
                        });

                        // Tabla de campos
                        col.Item().Table(t =>
                        {
                            t.ColumnsDefinition(columns =>
                            {
                                columns.ConstantColumn(30);
                                columns.RelativeColumn();
                                columns.RelativeColumn();
                                columns.ConstantColumn(60);
                                columns.ConstantColumn(60);
                                columns.ConstantColumn(60);
                                columns.RelativeColumn();
                            });

                            t.Header(header =>
                            {
                                header.Cell().Border(1).Background(Colors.Grey.Lighten2).Padding(3).Text("Nro").SemiBold();
                                header.Cell().Border(1).Background(Colors.Grey.Lighten2).Padding(3).Text("Nombre del Campo").SemiBold();
                                header.Cell().Border(1).Background(Colors.Grey.Lighten2).Padding(3).Text("Tipo dato longitud").SemiBold();
                                header.Cell().Border(1).Background(Colors.Grey.Lighten2).Padding(3).Text("Permite nulos").SemiBold();
                                header.Cell().Border(1).Background(Colors.Grey.Lighten2).Padding(3).Text("Clave primaria").SemiBold();
                                header.Cell().Border(1).Background(Colors.Grey.Lighten2).Padding(3).Text("Clave foránea").SemiBold();
                                header.Cell().Border(1).Background(Colors.Grey.Lighten2).Padding(3).Text("Descripción del campo").SemiBold();
                            });

                            for (int i = 0; i < tabla.Columns.Count; i++)
                            {
                                var colData = tabla.Columns[i];

                                t.Cell().Border(1).Padding(3).Text((i + 1).ToString());
                                t.Cell().Border(1).Padding(3).Text(colData.ColumnName);
                                t.Cell().Border(1).Padding(3).Text($"{colData.DataType}{(colData.MaxLength.HasValue ? $"({colData.MaxLength})" : "")}");
                                t.Cell().Border(1).Padding(3).Text(colData.IsNullable ? "Sí" : "No");
                                t.Cell().Border(1).Padding(3).Text(colData.IsPrimaryKey ? "Sí" : "No");
                                t.Cell().Border(1).Padding(3).Text(colData.IsForeignKey ? "Sí" : "No");
                                t.Cell().Border(1).Padding(3).Text(colData.Description ?? "");
                            }
                        });

                        col.Item().PageBreak();
                    }

                    // Sección adicional: DML
                    col.Item().PaddingTop(15).Text("Lenguaje de Manipulación de Datos (DML)").Bold();
                    col.Item().PaddingBottom(5).Text("(Ejemplos de 5 INSERT INTO por tabla, si están disponibles)");
                    foreach (var tabla in tablas)
                    {
                        col.Item().Text($"-- {tabla.TableName} --").Italic();
                        col.Item().Border(1).Padding(5).Text(tabla.DmlInserts ?? "INSERT no disponible.");
                        col.Item().PaddingBottom(10);
                    }

                    // Sección adicional: DDL
                    col.Item().PaddingTop(15).Text("Lenguaje de Definición de Datos (DDL)").Bold();
                    col.Item().PaddingBottom(5).Text("(Scripts CREATE TABLE por tabla, si están disponibles)");
                    foreach (var tabla in tablas)
                    {
                        col.Item().Text($"-- {tabla.TableName} --").Italic();
                        col.Item().Border(1).Padding(5).Text(tabla.DdlCreateScript ?? "CREATE TABLE script no disponible.");
                        col.Item().PaddingBottom(10);
                    }

                    // Sección adicional: Procedimientos Almacenados
                    col.Item().PaddingTop(15).Text("Procedimientos Almacenados").Bold();
                    col.Item().PaddingBottom(5).Text("(Por tabla si están disponibles)");
                    foreach (var tabla in tablas)
                    {
                        col.Item().Text($"-- {tabla.TableName} --").Italic();
                        col.Item().Border(1).Padding(5).Text(tabla.StoredProcedures ?? "No se encontraron procedimientos almacenados.");
                        col.Item().PaddingBottom(10);
                    }
                });
            });
        });

        return document.GeneratePdf();
    }

    public byte[] GenerarDiccionarioWord(List<TableSchemaDto> tablas)
    {
        using var memoryStream = new MemoryStream();
        
        // Crear documento Word
        using (var wordDocument = WordprocessingDocument.Create(memoryStream, WordprocessingDocumentType.Document))
        {
            // Añadir partes principales del documento
            var mainPart = wordDocument.AddMainDocumentPart();
            mainPart.Document = new DocumentFormat.OpenXml.Wordprocessing.Document();
            var body = mainPart.Document.AppendChild(new Body());

            // Añadir un título al documento
            var titleParagraph = new Paragraph(
                new Run(
                    new Text("Diccionario de Datos") { Space = SpaceProcessingModeValues.Preserve }
                )
            );
            
            // Dar formato al título
            titleParagraph.ParagraphProperties = new ParagraphProperties(
                new ParagraphStyleId() { Val = "Heading1" },
                new Justification() { Val = JustificationValues.Center }
            );
            
            body.AppendChild(titleParagraph);
            
            // Para cada tabla en el diccionario
            foreach (var tabla in tablas)
            {
                // Añadir título de la tabla
                var tableTitleParagraph = new Paragraph(
                    new Run(
                        new Text($"Tabla: {tabla.TableName}") { Space = SpaceProcessingModeValues.Preserve }
                    )
                );
                
                tableTitleParagraph.ParagraphProperties = new ParagraphProperties(
                    new ParagraphStyleId() { Val = "Heading2" }
                );
                
                body.AppendChild(tableTitleParagraph);
                
                // Información general de la tabla
                AgregarInformacionGeneral(body, "Descripción:", tabla.TableDescription ?? "");
                AgregarInformacionGeneral(body, "Propósito:", tabla.TablePurpose ?? "");
                AgregarInformacionGeneral(body, "Relaciones:", tabla.TableRelationships ?? "Sin relaciones");
                
                // Crear tabla de columnas
                var tableElement = new Table();
                
                // Propiedades de la tabla
                tableElement.AppendChild(new TableProperties(
                    new TableBorders(
                        new TopBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 1 },
                        new BottomBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 1 },
                        new LeftBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 1 },
                        new RightBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 1 },
                        new InsideHorizontalBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 1 },
                        new InsideVerticalBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 1 }
                    )
                ));
                
                // Añadir fila de encabezado
                tableElement.AppendChild(new TableRow(
                    CreateTableCell("Nº", true),
                    CreateTableCell("Nombre", true),
                    CreateTableCell("Tipo de Dato", true),
                    CreateTableCell("Nulo", true),
                    CreateTableCell("PK", true),
                    CreateTableCell("FK", true),
                    CreateTableCell("Descripción", true)
                ));
                
                // Añadir filas de datos
                for (int i = 0; i < tabla.Columns.Count; i++)
                {
                    var col = tabla.Columns[i];
                    string dataType = col.DataType;
                    
                    if (col.MaxLength.HasValue && col.MaxLength > 0 && dataType != "int" && dataType != "bit")
                        dataType += $"({col.MaxLength})";
                    
                    tableElement.AppendChild(new TableRow(
                        CreateTableCell((i + 1).ToString()),
                        CreateTableCell(col.ColumnName),
                        CreateTableCell(dataType),
                        CreateTableCell(col.IsNullable ? "Sí" : "No"),
                        CreateTableCell(col.IsPrimaryKey ? "Sí" : "No"),
                        CreateTableCell(col.IsForeignKey ? "Sí" : "No"),
                        CreateTableCell(col.Description ?? "")
                    ));
                }
                
                body.AppendChild(tableElement);
                
                // Agregar sección de scripts SQL y DML si existen
                if (!string.IsNullOrEmpty(tabla.DdlCreateScript))
                {
                    AgregarSeccionCodigo(body, "Script de Creación (DDL):", tabla.DdlCreateScript);
                }
                
                if (!string.IsNullOrEmpty(tabla.DmlInserts))
                {
                    AgregarSeccionCodigo(body, "Ejemplos de Inserciones (DML):", tabla.DmlInserts);
                }
                
                // Agregar un salto de página después de cada tabla
                body.AppendChild(new Paragraph(new Run(new Break() { Type = BreakValues.Page })));
            }
            
            wordDocument.Save();
        }
        
        return memoryStream.ToArray();
    }
    
    private void AgregarInformacionGeneral(Body body, string titulo, string contenido)
    {
        var paragraph = new Paragraph(
            new Run(
                new Text(titulo) { Space = SpaceProcessingModeValues.Preserve }
            ) { RunProperties = new RunProperties(new Bold()) },
            new Run(
                new Text($" {contenido}") { Space = SpaceProcessingModeValues.Preserve }
            )
        );
        
        body.AppendChild(paragraph);
    }
    
    private void AgregarSeccionCodigo(Body body, string titulo, string codigo)
    {
        // Título de la sección
        var titleParagraph = new Paragraph(
            new Run(
                new Text(titulo) { Space = SpaceProcessingModeValues.Preserve }
            )
        ) { ParagraphProperties = new ParagraphProperties(new ParagraphStyleId() { Val = "Heading3" }) };
        
        body.AppendChild(titleParagraph);
        
        // Contenido del código con formato monoespaciado
        var codeParagraph = new Paragraph(
            new Run(
                new Text(codigo) { Space = SpaceProcessingModeValues.Preserve }
            ) { RunProperties = new RunProperties(new RunFonts() { Ascii = "Courier New" }) }
        );
        
        codeParagraph.ParagraphProperties = new ParagraphProperties(
            new Indentation() { Left = "720" }
        );
        
        body.AppendChild(codeParagraph);
    }
    
    private TableCell CreateTableCell(string text, bool isHeader = false)
    {
        TableCell cell = new TableCell(
            new Paragraph(
                new Run(
                    new Text(text) { Space = SpaceProcessingModeValues.Preserve }
                )
            )
        );
        
        // Propiedades de la celda
        cell.TableCellProperties = new TableCellProperties(
            new TableCellWidth() { Type = TableWidthUnitValues.Auto }
        );
        
        // Si es encabezado, ponerlo en negrita
        if (isHeader)
        {
            cell.TableCellProperties.AppendChild(new Shading() { 
                Fill = "DDDDDD", 
                Val = ShadingPatternValues.Clear 
            });
            
            RunProperties runProperties = new RunProperties(new Bold());
            cell.Descendants<Run>().First().RunProperties = runProperties;
        }
        
        return cell;
    }
}