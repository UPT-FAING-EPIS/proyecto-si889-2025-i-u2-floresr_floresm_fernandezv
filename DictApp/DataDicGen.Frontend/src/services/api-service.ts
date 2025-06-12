import axios from 'axios';
import { DatabaseConnectionDto, ConnectionResponseDto, TableSchemaDto } from '../types/api-types';

// URL base de la API backend (actualizada al puerto correcto)
const API_URL = 'http://localhost:5175/api';

// Crear una instancia de axios con configuración personalizada
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Servicios para conectarse y obtener datos
export const apiService = {
  // Autenticar usuario
  async login(username: string, password: string): Promise<boolean> {
    try {
      const response = await apiClient.post('/Auth/login', {
        username,
        password
      });
      return response.status === 200;
    } catch (error) {
      console.error('Error de autenticación:', error);
      return false;
    }
  },

  // Conectar a la base de datos y obtener un token
  async connectToDatabase(credentials: DatabaseConnectionDto): Promise<ConnectionResponseDto> {
    const response = await apiClient.post<ConnectionResponseDto>('/Metadata/connect', credentials);
    return response.data;
  },

  // Descargar el diccionario en formato PDF usando un token
  async downloadPdfDictionary(token: string): Promise<Blob> {
    const response = await apiClient.get(`/Metadata/diccionario/pdf/${token}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Descargar el diccionario en formato Word usando un token
  async downloadWordDictionary(token: string): Promise<Blob> {
    const response = await apiClient.get(`/Word/diccionario/word/${token}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Descargar el diccionario en PDF usando credenciales directamente
  async downloadPdfWithCredentials(credentials: DatabaseConnectionDto): Promise<Blob> {
    const response = await apiClient.post('/Metadata/diccionario/pdf', credentials, {
      responseType: 'blob'
    });
    return response.data;
  },
  
  // Descargar el diccionario en Word usando credenciales directamente
  async downloadWordWithCredentials(credentials: DatabaseConnectionDto): Promise<Blob> {
    const response = await apiClient.post('/Word/diccionario/word', credentials, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Visualizar el PDF en el navegador
  async viewPdfDictionary(credentials: DatabaseConnectionDto): Promise<Blob> {
    const response = await apiClient.post('/PdfView/ver-diccionario', credentials, {
      responseType: 'blob'
    });
    return response.data;
  },


  // ⬅️ NUEVOS MÉTODOS PARA PREVIEW
  // Generar vista previa editable del diccionario
  async generatePreview(credentials: DatabaseConnectionDto): Promise<any> {
    const response = await apiClient.post('/Metadata/generate-preview', credentials);
    return response.data;
  },

  // Exportar PDF con datos editados del preview
  async exportPdfFromPreview(previewData: any): Promise<Blob> {
    const response = await apiClient.post('/Metadata/export-pdf', previewData, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Generar vista previa editable del diccionario para MySQL
  async generatePreviewMySql(credentials: DatabaseConnectionDto): Promise<any> {
    const response = await apiClient.post('/Metadata/mysql/generate-preview', credentials);
    return response.data;
  },

  // Generar vista previa editable del diccionario para PostgreSQL
  async generatePreviewPostgres(credentials: DatabaseConnectionDto): Promise<any> {
    const response = await apiClient.post('/Metadata/postgres/generate-preview', credentials);
    return response.data;
  },

  // Generar vista previa editable del diccionario para MongoDB
  async generatePreviewMongo(credentials: DatabaseConnectionDto): Promise<any> {
    const response = await apiClient.post('/Metadata/mongo/generate-preview', credentials);
    return response.data;
  },
};
