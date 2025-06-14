# 📑 DataDictGen - Generador de Diccionarios de Datos

Aplicación web para generar diccionarios de datos automáticamente desde bases de datos relacionales y NoSQL.

## 🎯 Características

- Extracción automática de metadatos
- Documentación con IA (OpenAI)
- Exportación a Word y PDF
- Soporte para múltiples BD
- Interfaz web moderna


## 📋 Requisitos

- .NET 8.0 SDK
- Node.js 18+
- Cuenta AWS
- OpenAI API Key



### GitHub Secrets (para deploy)
```
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx

```

## ☁️ Despliegue AWS

### 1. Infraestructura con Terraform
```bash
cd terraform
terraform init
terraform plan
terraform apply
```

### 2. Deploy con GitHub Actions
- Configurar secrets en GitHub
- Push tag: `git tag v1.0.0 && git push origin v1.0.0`
- O ejecutar workflow manualmente

## �️ Bases de Datos Soportadas

| Base de Datos | Puerto | Estado |
|---------------|--------|--------|
| SQL Server    | 1433   | ✅ |
| MySQL         | 3306   | ✅ |
| PostgreSQL    | 5432   | ✅ |
| MongoDB       | 27017  | ✅ |
| Redis         | 6379   | ✅ |
| Cassandra     | 9042   | ✅ |

## 🔌 API Endpoints

### Autenticación
```bash
POST /api/auth/login
POST /api/auth/register
```

### Metadatos
```bash
POST /api/metadata/test-connection
POST /api/metadata/database-preview
POST /api/metadata/table-schema
```

### Documentos
```bash
POST /api/word/generate-word
POST /api/word/generate-pdf
```

## � Equipo

- **Flores Melendez Andree Sebastian** 
- **Flores Ramos Mario Anthonio**
- **Fernandez Villanueva Daleska** 

