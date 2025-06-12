import React from 'react';
import { 
  Container, Box, Grid, Paper, Typography, Button
} from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import DescriptionIcon from '@mui/icons-material/Description';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

interface MainMenuProps {
  onSelectOption: (option: string) => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onSelectOption }) => {
  // Opciones del menú principal
  const menuOptions = [
    {
      id: 'sql',
      title: 'SQL Server',
      description: 'Generar diccionario de datos desde SQL Server',
      icon: <StorageIcon fontSize="large" />,
      color: '#1976d2'
    },
    {
      id: 'mysql',
      title: 'MySQL',
      description: 'Generar diccionario de datos desde MySQL',
      icon: <StorageIcon fontSize="large" />,
      color: '#388e3c'
    },
    {
      id: 'option2',
      title: 'Opción 2',
      description: 'Funcionalidad pendiente por definir',
      icon: <DescriptionIcon fontSize="large" />,
      color: '#f50057'
    },
    {
      id: 'option3',
      title: 'Opción 3',
      description: 'Funcionalidad pendiente por definir',
      icon: <AccountTreeIcon fontSize="large" />,
      color: '#9c27b0'
    },
    {
      id: 'option4',
      title: 'Opción 4',
      description: 'Funcionalidad pendiente por definir',
      icon: <SettingsIcon fontSize="large" />,
      color: '#ff9800'
    },
    {
      id: 'postgres',
      title: 'PostgreSQL',
      description: 'Generar diccionario de datos desde PostgreSQL',
      icon: <StorageIcon fontSize="large" />,
      color: '#ff7043'
    },
    {
      id: 'mongo',
      title: 'MongoDB',
      description: 'Generar diccionario de datos desde MongoDB',
      icon: <StorageIcon fontSize="large" />,
      color: '#26a69a'
    }
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Selecciona una opción
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {menuOptions.map((option) => (
            <Grid item xs={12} sm={6} md={3} key={option.id}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    cursor: 'pointer'
                  }
                }}
                onClick={() => onSelectOption(option.id)}
              >
                <Box 
                  sx={{ 
                    color: option.color, 
                    mb: 2,
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  {option.icon}
                </Box>
                <Typography variant="h6" component="h3" gutterBottom>
                  {option.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                  {option.description}
                </Typography>
                <Button 
                  variant="outlined" 
                  sx={{ color: option.color, borderColor: option.color }}
                  onClick={() => onSelectOption(option.id)}
                >
                  Seleccionar
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default MainMenu;