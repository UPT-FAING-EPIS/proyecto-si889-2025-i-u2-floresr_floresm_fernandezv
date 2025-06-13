import React, { useState } from 'react';
import { 
  Box, Button, Card, CardContent, TextField, Typography, 
  CircularProgress, Alert
} from '@mui/material';
import PreviewIcon from '@mui/icons-material/Preview';
import { DatabaseConnectionDto } from '../types/api-types';
import { apiService } from '../services/api-service';

interface MySqlConnectionFormProps {
  onPreviewGenerated?: (data: any, databaseType?: 'mysql' | 'postgresql' | 'mongodb' | 'sqlserver') => void;
}

const MySqlConnectionForm: React.FC<MySqlConnectionFormProps> = ({ onPreviewGenerated }) => {  const [connectionData, setConnectionData] = useState<DatabaseConnectionDto>({
    server: 'localhost',
    database: 'test',
    user: 'root',
    password: '',
    port: 3306 // Puerto por defecto de MySQL
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
      const data = await apiService.generatePreviewMySql(connectionData);
      onPreviewGenerated?.(data, 'mysql');
    } catch (err) {
      setError('Error al generar preview MySQL');
      console.error('Error completo:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card variant="outlined" sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Conexión a MySQL
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}        <TextField
          label="Servidor"
          name="server"
          value={connectionData.server}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          placeholder="localhost"
        />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Puerto"
            name="port"
            type="number"
            value={connectionData.port}
            onChange={(e) => setConnectionData(prev => ({ ...prev, port: parseInt(e.target.value) || 3306 }))}
            margin="normal"
            sx={{ width: '30%' }}
            placeholder="3306"
          />
          <TextField
            label="Base de datos"
            name="database"
            value={connectionData.database}
            onChange={handleChange}
            margin="normal"
            required
            sx={{ width: '70%' }}
          />
        </Box>
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
            {loading ? <CircularProgress size={24} /> : 'Vista Previa y Edición (MySQL)'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MySqlConnectionForm;
