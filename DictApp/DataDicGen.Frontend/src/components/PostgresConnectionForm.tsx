import React, { useState } from 'react';
import { Box, Button, Card, CardContent, TextField, Typography, CircularProgress, Alert } from '@mui/material';
import PreviewIcon from '@mui/icons-material/Preview';
import { DatabaseConnectionDto } from '../types/api-types';
import { apiService } from '../services/api-service';

interface PostgresConnectionFormProps {
  onPreviewGenerated?: (data: any, dbType?: 'mysql' | 'postgresql' | 'mongodb' | 'sqlserver') => void;
}

const PostgresConnectionForm: React.FC<PostgresConnectionFormProps> = ({ onPreviewGenerated }) => {
  const [connectionData, setConnectionData] = useState<DatabaseConnectionDto>({
    server: '',
    database: '',
    user: '',
    password: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConnectionData(prev => ({ ...prev, [name]: value }));
  };
  const handleGeneratePreview = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.generatePreviewPostgres(connectionData);
      onPreviewGenerated?.(data, 'postgresql'); // <-- Pasamos el tipo de BD
    } catch (err) {
      setError('Error al generar preview PostgreSQL');
      console.error('Error completo:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card variant="outlined" sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Conexión a PostgreSQL
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}
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
            variant="contained"
            color="info"
            onClick={handleGeneratePreview}
            disabled={loading}
            fullWidth
            startIcon={<PreviewIcon />}
            sx={{ py: 1.5, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Vista Previa y Edición (PostgreSQL)'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PostgresConnectionForm;
