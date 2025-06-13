import React, { useState } from 'react';
import { 
  Box, Button, Card, CardContent, TextField, Typography, 
  CircularProgress, Alert, Link
} from '@mui/material';
import { apiService } from '../services/api-service';

interface RegisterFormProps {
  onRegisterSuccess: () => void;
  onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegisterSuccess, onSwitchToLogin }) => {
  // Estado para los datos del formulario
  const [registerData, setRegisterData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });

  // Estados para manejar la interacción con el usuario
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar errores cuando el usuario empiece a escribir
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  // Validar el formulario
  const validateForm = (): string | null => {
    if (registerData.username.length < 3) {
      return 'El usuario debe tener al menos 3 caracteres';
    }
    
    if (registerData.password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (registerData.password !== registerData.confirmPassword) {
      return 'Las contraseñas no coinciden';
    }
    
    return null;
  };

  // Manejar el registro
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validar formulario
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      // Intentar registrar en el backend
      const result = await apiService.register(
        registerData.username, 
        registerData.password
      );
      
      if (result.success) {
        setSuccess(result.message);
        // Limpiar formulario
        setRegisterData({
          username: '',
          password: '',
          confirmPassword: ''
        });
        
        // Llamar callback de éxito después de un breve delay
        setTimeout(() => {
          onRegisterSuccess();
        }, 1500);
      } else {
        setError(result.message);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error durante el registro');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card variant="outlined" sx={{ maxWidth: 400, mx: 'auto', mt: 8 }}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom align="center">
          Registrarse
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        
        <form onSubmit={handleRegister}>
          <TextField
            label="Usuario"
            name="username"
            value={registerData.username}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            helperText="Mínimo 3 caracteres"
          />
          <TextField
            label="Contraseña"
            name="password"
            type="password"
            value={registerData.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            helperText="Mínimo 6 caracteres"
          />
          <TextField
            label="Confirmar Contraseña"
            name="confirmPassword"
            type="password"
            value={registerData.confirmPassword}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            helperText="Debe coincidir con la contraseña"
          />
          
          <Box sx={{ mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Registrarse'}
            </Button>
          </Box>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              ¿Ya tienes una cuenta?{' '}
              <Link
                component="button"
                variant="body2"
                onClick={(e) => {
                  e.preventDefault();
                  onSwitchToLogin();
                }}
                sx={{ cursor: 'pointer' }}
              >
                Iniciar Sesión
              </Link>
            </Typography>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

export default RegisterForm;
