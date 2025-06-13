import axios from 'axios';
import { DatabaseConnectionDto, ConnectionResponseDto } from '../types/api-types';

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
      console.log('Intentando login con:', { username, apiUrl: API_URL });
      
      const response = await apiClient.post('/Auth/login', {
        username,
        password
      });
      
      console.log('Respuesta del login:', response.status, response.data);
      return response.status === 200;
    } catch (error: any) {
      console.error('Error de autenticación:', error);
      
      if (error.response) {
        // El servidor respondió con un código de error
        console.error('Error response:', error.response.status, error.response.data);
      } else if (error.request) {
        // La request se hizo pero no se recibió respuesta
        console.error('Error request:', error.request);
      } else {
        // Algo pasó al configurar la request
        console.error('Error config:', error.message);
      }
      
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
    try {
      console.log('Enviando datos MySQL:', credentials);
      const response = await apiClient.post('/Metadata/mysql/generate-preview', credentials);
      console.log('Respuesta MySQL exitosa:', response.status, response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error MySQL completo:', error);
      
      if (error.response) {
        console.error('Error MySQL response:', error.response.status, error.response.data);
        console.error('Headers:', error.response.headers);
      } else if (error.request) {
        console.error('Error MySQL request:', error.request);
      } else {
        console.error('Error MySQL config:', error.message);
      }
      
      throw error;
    }
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
