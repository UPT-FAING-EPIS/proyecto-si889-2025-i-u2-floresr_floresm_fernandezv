import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Box,
  Typography,
  IconButton,
  FormControlLabel,
  Checkbox,
  Paper,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { ERDiagram } from './ERDiagram';
import { GlobalSearch } from './GlobalSearch';
import { DatabaseMetrics } from './DatabaseMetrics';

interface DatabasePreviewProps {
  preview: any;
  onExport: (data: any) => Promise<void>;
  onBack: () => void;
  databaseType?: 'mysql' | 'postgresql' | 'mongodb' | 'sqlserver' | 'redis' | 'cassandra';
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const DatabasePreview: React.FC<DatabasePreviewProps> = ({
  preview: initialPreview,
  onExport,
  onBack,
  databaseType = 'mysql'
}) => {
  const [preview, setPreview] = useState(initialPreview);
  const [editingTable, setEditingTable] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [filteredTables, setFilteredTables] = useState(initialPreview.tables);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSearchResults = (searchResults: any[]) => {
    setFilteredTables(searchResults);
  };

  const handleTableChange = (tableIndex: number, field: string, value: string) => {
    const updatedTables = [...preview.tables];
    updatedTables[tableIndex] = {
      ...updatedTables[tableIndex],
      [field]: value
    };
    setPreview({ ...preview, tables: updatedTables });
  };

  const handleColumnChange = (tableIndex: number, columnIndex: number, value: string) => {
    const updatedTables = [...preview.tables];
    updatedTables[tableIndex].columns[columnIndex].description = value;
    setPreview({ ...preview, tables: updatedTables });
  };

  const handleDeleteTable = (tableIndex: number, tableName: string) => {
    if (window.confirm(`¿Está seguro que desea eliminar la tabla "${tableName}" del diccionario?`)) {
      const updatedTables = preview.tables.filter((_: any, index: number) => index !== tableIndex);
      setPreview({ ...preview, tables: updatedTables });
      showSnackbar(`Tabla "${tableName}" eliminada del diccionario`);
      
      if (editingTable === tableName) {
        setEditingTable(null);
      }
    }
  };

  const handleRestoreAllTables = () => {
    if (window.confirm('¿Desea restaurar todas las tablas originales?')) {
      setPreview(initialPreview);
      setEditingTable(null);
      showSnackbar('Todas las tablas han sido restauradas');
    }
  };

  const handleMetadataChange = (field: string, value: any) => {
    setPreview({
      ...preview,
      metadata: { ...preview.metadata, [field]: value }
    });
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      await onExport(preview);
      showSnackbar('PDF exportado exitosamente');
    } catch (error) {
      showSnackbar('Error al exportar PDF', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const renderTableCard = (table: any, tableIndex: number) => {
    const isEditing = editingTable === table.tableName;

    return (
      <Card key={table.tableName} sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">📋 {table.tableName}</Typography>
            <Box>
              <IconButton
                onClick={() => setEditingTable(isEditing ? null : table.tableName)}
                color={isEditing ? "primary" : "default"}
                size="small"
              >
                {isEditing ? <VisibilityIcon /> : <EditIcon />}
              </IconButton>
              <IconButton
                onClick={() => handleDeleteTable(tableIndex, table.tableName)}
                color="error"
                size="small"
                title="Eliminar tabla del diccionario"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>

          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>Descripción:</Typography>
              {isEditing ? (
                <TextField
                  multiline
                  rows={3}
                  fullWidth
                  value={table.tableDescription || ''}
                  onChange={(e) => handleTableChange(tableIndex, 'tableDescription', e.target.value)}
                  placeholder="Descripción de la tabla..."
                  variant="outlined"
                  size="small"
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {table.tableDescription || 'Sin descripción'}
                </Typography>
              )}
            </Box>
            <Box>
              <Typography variant="subtitle2" gutterBottom>Propósito:</Typography>
              {isEditing ? (
                <TextField
                  multiline
                  rows={3}
                  fullWidth
                  value={table.tablePurpose || ''}
                  onChange={(e) => handleTableChange(tableIndex, 'tablePurpose', e.target.value)}
                  placeholder="Propósito de la tabla..."
                  variant="outlined"
                  size="small"
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {table.tablePurpose || 'Sin propósito definido'}
                </Typography>
              )}
            </Box>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell width={50}>Nº</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Nulo</TableCell>
                  <TableCell>PK</TableCell>
                  <TableCell>FK</TableCell>
                  <TableCell>Descripción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {table.columns.map((column: any, columnIndex: number) => (
                  <TableRow key={columnIndex}>
                    <TableCell>{columnIndex + 1}</TableCell>
                    <TableCell>{column.columnName}</TableCell>
                    <TableCell>{column.dataType}</TableCell>
                    <TableCell>{column.isNullable ? 'Sí' : 'No'}</TableCell>
                    <TableCell>{column.isPrimaryKey ? 'Sí' : 'No'}</TableCell>
                    <TableCell>{column.isForeignKey ? 'Sí' : 'No'}</TableCell>
                    <TableCell>
                      {isEditing ? (
                        <TextField
                          multiline
                          rows={2}
                          fullWidth
                          value={column.description || ''}
                          onChange={(e) => handleColumnChange(tableIndex, columnIndex, e.target.value)}
                          placeholder="Descripción del campo..."
                          variant="outlined"
                          size="small"
                        />
                      ) : (
                        <Typography variant="body2" fontSize="12px">
                          {column.description || 'Sin descripción'}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <GlobalSearch tables={preview.tables || []} onSearchResults={handleSearchResults} />
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">📄 Vista Previa del Diccionario</Typography>
        <Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            sx={{ mr: 2 }}
          >
            Atrás
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            disabled={loading}
            size="large"
          >
            Exportar PDF
          </Button>
        </Box>
      </Box>      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="🗂️ Metadatos" />
          <Tab label="📊 Métricas" />
          <Tab label="🌐 Diagrama ER" />
          <Tab label={`� Tablas (${filteredTables?.length || 0})`} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>📋 Información del Documento</Typography>
            
            <Box mb={3}>
              <Typography variant="subtitle2" gutterBottom>Título:</Typography>
              <TextField
                fullWidth
                value={preview.metadata?.title || ''}
                onChange={(e) => handleMetadataChange('title', e.target.value)}
                placeholder="Título del documento..."
                variant="outlined"
                sx={{ mt: 1 }}
              />
            </Box>

            <Box mb={3}>
              <Typography variant="subtitle2" gutterBottom>Descripción:</Typography>
              <TextField
                multiline
                rows={4}
                fullWidth
                value={preview.metadata?.description || ''}
                onChange={(e) => handleMetadataChange('description', e.target.value)}
                placeholder="Descripción del documento..."
                variant="outlined"
                sx={{ mt: 1 }}
              />
            </Box>

            <Typography variant="h6" gutterBottom>⚙️ Opciones de Exportación</Typography>
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={preview.metadata?.includeDML || false}
                  onChange={(e) => handleMetadataChange('includeDML', e.target.checked)}
                />
              }
              label="Incluir sentencias DML (INSERT, UPDATE, DELETE)"
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={preview.metadata?.includeDDL || false}
                  onChange={(e) => handleMetadataChange('includeDDL', e.target.checked)}
                />
              }
              label="Incluir sentencias DDL (CREATE, ALTER, DROP)"
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={preview.metadata?.includeStoredProcedures || false}
                  onChange={(e) => handleMetadataChange('includeStoredProcedures', e.target.checked)}
                />
              }
              label="Incluir procedimientos almacenados"
            />

            <Box mt={3} p={2} bgcolor="grey.100" borderRadius={1}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle1">Gestión de Tablas</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tablas incluidas: {preview.tables?.length || 0}
                    {initialPreview.tables.length !== preview.tables?.length && 
                      ` (${initialPreview.tables.length - preview.tables.length} eliminadas)`
                    }
                  </Typography>
                </Box>
                <Button
                  onClick={handleRestoreAllTables}
                  variant="outlined"
                  size="small"
                  disabled={initialPreview.tables.length === preview.tables?.length}
                >
                  Restaurar Todas
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>      <TabPanel value={tabValue} index={1}>
        <DatabaseMetrics tables={filteredTables || []} databaseType={databaseType} />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <ERDiagram tables={filteredTables || []} />
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Box>
          {filteredTables?.map((table: any, index: number) => renderTableCard(table, index))}
        </Box>
      </TabPanel>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>  );
};