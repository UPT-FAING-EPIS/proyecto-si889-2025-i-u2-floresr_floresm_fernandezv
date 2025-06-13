import React from 'react';
import { 
  Container, Box, Paper, Typography, Button
} from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import MemoryIcon from '@mui/icons-material/Memory';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ViewModuleIcon from '@mui/icons-material/ViewModule';

interface MainMenuProps {
  onSelectOption: (option: string) => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onSelectOption }) => {  // Opciones del menú principal
  const menuOptions = [
    {
      id: 'sql',
      title: 'SQL Server',
      description: 'Base de datos relacional de Microsoft',
      icon: <StorageIcon fontSize="large" />,
      color: '#1976d2'
    },
    {
      id: 'mysql',
      title: 'MySQL',
      description: 'Base de datos relacional open source',
      icon: <StorageIcon fontSize="large" />,
      color: '#388e3c'
    },
    {
      id: 'postgres',
      title: 'PostgreSQL',
      description: 'Base de datos relacional avanzada',
      icon: <StorageIcon fontSize="large" />,
      color: '#ff7043'
    },
    {
      id: 'mongo',
      title: 'MongoDB',
      description: 'Base de datos NoSQL orientada a documentos',
      icon: <AccountTreeIcon fontSize="large" />,
      color: '#26a69a'
    },
    {
      id: 'redis',
      title: 'Redis',
      description: 'Base de datos en memoria clave-valor',
      icon: <MemoryIcon fontSize="large" />,
      color: '#e53e3e'
    },
    {
      id: 'cassandra',
      title: 'Cassandra',
      description: 'Base de datos NoSQL orientada a columnas',
      icon: <ViewModuleIcon fontSize="large" />,
      color: '#9c27b0'
    }
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Selecciona una opción
        </Typography>
          <Box 
          display="grid" 
          gridTemplateColumns="repeat(auto-fit, minmax(280px, 1fr))" 
          gap={3} 
          sx={{ mt: 2 }}
        >
          {menuOptions.map((option) => (
            <Paper 
              key={option.id}
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
                  {option.title}                </Typography>
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
          ))}
        </Box>
      </Box>
    </Container>
  );
};

export default MainMenu;