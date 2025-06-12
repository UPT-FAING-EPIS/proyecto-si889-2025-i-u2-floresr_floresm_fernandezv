import React, { useState } from 'react';
import { Box, Button, AppBar, Toolbar, Typography, IconButton, Container } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LoginForm from '../components/LoginForm';
import MainMenu from '../components/MainMenu';
import SqlConnectionForm from '../components/SqlConnectionForm';
import MySqlConnectionForm from '../components/MySqlConnectionForm';
import PostgresConnectionForm from '../components/PostgresConnectionForm';
import MongoConnectionForm from '../components/MongoConnectionForm';
import { DatabasePreview } from '../components/DatabasePreview';
import { apiService } from '../services/api-service'; // ⬅️ Agregar import

enum AppScreen {
  LOGIN,
  MAIN_MENU,
  SQL_CONNECTION,
  MYSQL_CONNECTION,
  POSTGRES_CONNECTION,
  MONGO_CONNECTION, // <-- NUEVO
  DATABASE_PREVIEW // ⬅️ Agregar nueva pantalla
}

const HomePage: React.FC = () => {
  // Estado para controlar qué pantalla mostrar
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.LOGIN);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<any>(null); // ⬅️ Agregar estado para preview
  
  // Manejar el éxito del login
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setCurrentScreen(AppScreen.MAIN_MENU);
  };
  
  // Manejar selección de opción en el menú principal
  const handleOptionSelect = (option: string) => {
    switch (option) {
      case 'sql':
        setCurrentScreen(AppScreen.SQL_CONNECTION);
        break;
      case 'mysql':
        setCurrentScreen(AppScreen.MYSQL_CONNECTION);
        break;
      case 'postgres':
        setCurrentScreen(AppScreen.POSTGRES_CONNECTION);
        break;
      case 'mongo':
        setCurrentScreen(AppScreen.MONGO_CONNECTION);
        break;
      default:
        alert(`Opción "${option}" - Funcionalidad no implementada aún`);
    }
  };
  
  // Volver a la pantalla anterior
const handleGoBack = () => {
    if (currentScreen === AppScreen.DATABASE_PREVIEW) {
      setCurrentScreen(AppScreen.SQL_CONNECTION);
      setPreviewData(null);
    } else if (currentScreen === AppScreen.SQL_CONNECTION) {
      setCurrentScreen(AppScreen.MAIN_MENU);
    } else if (currentScreen === AppScreen.MAIN_MENU && isLoggedIn) {
      if (confirm('¿Está seguro que desea cerrar sesión?')) {
        setIsLoggedIn(false);
        setCurrentScreen(AppScreen.LOGIN);
      }
    }
  };
  
  // Titulo de la página según la pantalla actual
 const getPageTitle = (): string => {
    switch (currentScreen) {
      case AppScreen.LOGIN:
        return 'DataDicGen - Login';
      case AppScreen.MAIN_MENU:
        return 'DataDicGen - Menú Principal';
      case AppScreen.SQL_CONNECTION:
        return 'DataDicGen - SQL Server';
      case AppScreen.MYSQL_CONNECTION:
        return 'DataDicGen - MySQL'; // <-- NUEVO
      case AppScreen.POSTGRES_CONNECTION:
        return 'DataDicGen - PostgreSQL'; // <-- NUEVO
      case AppScreen.DATABASE_PREVIEW:
        return 'DataDicGen - Vista Previa';
      default:
        return 'DataDicGen';
    }
  };
  
  // Renderizar la pantalla actual
const renderCurrentScreen = () => {
    switch (currentScreen) {
      case AppScreen.LOGIN:
        return <LoginForm onLoginSuccess={handleLoginSuccess} />;
      case AppScreen.MAIN_MENU:
        return <MainMenu onSelectOption={handleOptionSelect} />;
      case AppScreen.SQL_CONNECTION:
        return <SqlConnectionForm onPreviewGenerated={handlePreviewGenerated} />;
      case AppScreen.MYSQL_CONNECTION:
        return <MySqlConnectionForm onPreviewGenerated={handlePreviewGenerated} />;
      case AppScreen.POSTGRES_CONNECTION:
        return <PostgresConnectionForm onPreviewGenerated={handlePreviewGenerated} />;
      case AppScreen.MONGO_CONNECTION:
        return <MongoConnectionForm onPreviewGenerated={handlePreviewGenerated} />;
      case AppScreen.DATABASE_PREVIEW:
        return previewData ? (
          <DatabasePreview
            preview={previewData}
            onExport={handleExportPdf}
            onBack={handleBackFromPreview}
          />
        ) : <div>Cargando preview...</div>;
      default:
        return <div>Pantalla no encontrada</div>;
    }
  };
   const handlePreviewGenerated = (data: any) => {
    setPreviewData(data);
    setCurrentScreen(AppScreen.DATABASE_PREVIEW);
  };
  const handleExportPdf = async (editedData: any) => {
    try {
      // Usar api-service en lugar de fetch directo
      const blob = await apiService.exportPdfFromPreview(editedData);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'diccionario-datos.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error:', error);
      alert('Error al exportar PDF');
    }
  };


  const handleBackFromPreview = () => {
    setCurrentScreen(AppScreen.SQL_CONNECTION);
    setPreviewData(null);
  };
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100vh',
        width: '100%',
        overflow: 'hidden' 
      }}
    >
      <AppBar position="static">
        <Toolbar>
          {currentScreen !== AppScreen.LOGIN && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="back"
              onClick={handleGoBack}
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {getPageTitle()}
          </Typography>
          {isLoggedIn && (
            <Button 
              color="inherit" 
              onClick={() => {
                if (confirm('¿Está seguro que desea cerrar sesión?')) {
                  setIsLoggedIn(false);
                  setCurrentScreen(AppScreen.LOGIN);
                }
              }}
            >
              Cerrar Sesión
            </Button>
          )}
        </Toolbar>
      </AppBar>
      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          overflow: 'auto',
          p: 2
        }}
      >
        {renderCurrentScreen()}
      </Box>
      
      <Box 
        component="footer" 
        sx={{ 
          py: 2, 
          px: 2, 
          backgroundColor: (theme) => theme.palette.grey[200],
          width: '100%'
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} DataDicGen - Generador de Diccionario de Datos
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;