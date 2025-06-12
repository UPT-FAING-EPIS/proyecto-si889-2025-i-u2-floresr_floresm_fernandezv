import React, { useState } from 'react';
import { 
  Box, Button, Card, CardContent, TextField, Typography, 
  CircularProgress, Alert 
} from '@mui/material';
import { apiService } from '../services/api-service';

interface LoginFormProps {
  onLoginSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  // Estado para los datos del formulario
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });

  // Estados para manejar la interacción con el usuario
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar el login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Intentar autenticar con el backend
      const isAuthenticated = await apiService.login(
        loginData.username, 
        loginData.password
      );
      
      if (isAuthenticated) {
        onLoginSuccess();
      } else {
        setError('Usuario o contraseña incorrectos');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error durante el inicio de sesión');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card variant="outlined" sx={{ maxWidth: 400, mx: 'auto', mt: 8 }}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom align="center">
          Iniciar Sesión
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleLogin}>
          <TextField
            label="Usuario"
            name="username"
            value={loginData.username}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Contraseña"
            name="password"
            type="password"
            value={loginData.password}
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
              {loading ? <CircularProgress size={24} /> : 'Iniciar Sesión'}
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;