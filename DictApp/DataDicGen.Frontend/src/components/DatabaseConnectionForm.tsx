import React, { useState } from 'react';
import { 
  Box, Button, Card, CardContent, TextField, Typography, 
  CircularProgress, Alert, Grid 
} from '@mui/material';
import { DatabaseConnectionDto } from '../types/api-types';
import { apiService } from '../services/api-service';

const DatabaseConnectionForm: React.FC = () => {
  // Estado para los datos del formulario
  const [connectionData, setConnectionData] = useState<DatabaseConnectionDto>({
    server: '',
    database: '',
    user: '',
    password: ''
  });

  // Estados para manejar la interacción con el usuario
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [connectionToken, setConnectionToken] = useState<string | null>(null);

  // Manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConnectionData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Conectar a la base de datos
  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await apiService.connectToDatabase(connectionData);
      setConnectionToken(response.token);
      setSuccessMessage(response.message);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al conectar con la base de datos');
      }
    } finally {
      setLoading(false);
    }
  };

  // Descargar el diccionario en PDF
  const handleDownloadPdf = async () => {
    try {
      setLoading(true);
      
      let pdfBlob;
      if (connectionToken) {
        // Usar el token si existe
        pdfBlob = await apiService.downloadPdfDictionary(connectionToken);
      } else {
        // Usar las credenciales directamente
        pdfBlob = await apiService.downloadPdfWithCredentials(connectionData);
      }
      
      // Crear una URL para el blob y descargar
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'diccionario_datos.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al descargar el PDF');
      }
    } finally {
      setLoading(false);
    }
  };

  // Descargar el diccionario en Word
  const handleDownloadWord = async () => {
    try {
      setLoading(true);
      
      let wordBlob;
      if (connectionToken) {
        // Usar el token si existe
        wordBlob = await apiService.downloadWordDictionary(connectionToken);
      } else {
        // Usar las credenciales directamente
        wordBlob = await apiService.downloadWordWithCredentials(connectionData);
      }
      
      // Crear una URL para el blob y descargar
      const url = window.URL.createObjectURL(wordBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'diccionario_datos.docx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al descargar el Word');
      }
    } finally {
      setLoading(false);
    }
  };

  // Visualizar el PDF en el navegador
  const handleViewPdf = async () => {
    try {
      setLoading(true);
      
      let pdfBlob;
      if (connectionToken) {
        // Usar el token si existe
        pdfBlob = await apiService.downloadPdfDictionary(connectionToken);
      } else {
        // Usar las credenciales directamente
        pdfBlob = await apiService.viewPdfDictionary(connectionData);
      }
      
      // Crear una URL para el blob y abrirlo en una nueva pestaña
      const url = window.URL.createObjectURL(pdfBlob);
      window.open(url, '_blank');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al visualizar el PDF');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card variant="outlined" sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Conexión a Base de Datos
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}
        
        <form onSubmit={handleConnect}>
          <TextField
            label="Servidor"
            name="server"
            value={connectionData.server}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            placeholder="localhost"
          />
          <TextField
            label="Base de datos"
            name="database"
            value={connectionData.database}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Usuario"
            name="user"
            value={connectionData.user}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Contraseña"
            name="password"
            type="password"
            value={connectionData.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          
          <Box sx={{ mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Conectar'}
            </Button>
          </Box>
        </form>
        
        {(connectionToken || (connectionData.server && connectionData.database && connectionData.user && connectionData.password)) && (
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={4}>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleDownloadPdf}
                disabled={loading}
                fullWidth
              >
                Descargar PDF
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleDownloadWord}
                disabled={loading}
                fullWidth
              >
                Descargar Word
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                variant="outlined"
                color="info"
                onClick={handleViewPdf}
                disabled={loading}
                fullWidth
              >
                Visualizar PDF
              </Button>
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export default DatabaseConnectionForm;