import React, { useState } from 'react';
import Card from 'antd/es/card';
import { Button, Input, Table, Tabs, Checkbox, message } from 'antd';
import Space from 'antd/es/space';
import { EditOutlined, EyeOutlined, DownloadOutlined, ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';
import { ERDiagram } from './ERDiagram'; // ⬅️ IMPORTAR EL DIAGRAMA

interface DatabasePreviewProps {
  preview: any;
  onExport: (data: any) => Promise<void>;
  onBack: () => void;
}

export const DatabasePreview: React.FC<DatabasePreviewProps> = ({
  preview: initialPreview,
  onExport,
  onBack
}) => {
  const [preview, setPreview] = useState(initialPreview);
  const [editingTable, setEditingTable] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
  // ⬅️ NUEVA FUNCIÓN: Eliminar tabla
  const handleDeleteTable = (tableIndex: number, tableName: string) => {
    if (confirm(`¿Está seguro que desea eliminar la tabla "${tableName}" del diccionario?`)) {
      const updatedTables = preview.tables.filter((_: any, index: number) => index !== tableIndex);
      setPreview({ ...preview, tables: updatedTables });
      message.success(`Tabla "${tableName}" eliminada del diccionario`);
      
      // Si estaba editando esa tabla, quitar el modo edición
      if (editingTable === tableName) {
        setEditingTable(null);
      }
    }
  };
   // ⬅️ NUEVA FUNCIÓN: Restaurar tabla eliminada (opcional)
  const handleRestoreAllTables = () => {
    if (confirm('¿Desea restaurar todas las tablas originales?')) {
      setPreview(initialPreview);
      setEditingTable(null);
      message.success('Todas las tablas han sido restauradas');
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
      message.success('PDF exportado exitosamente');
    } catch (error) {
      message.error('Error al exportar PDF');
    } finally {
      setLoading(false);
    }
  };

  const renderTableCard = (table: any, tableIndex: number) => {
    const isEditing = editingTable === table.tableName;

    const columns = [
      { title: 'Nº', width: 50, render: (_: any, __: any, index: number) => index + 1 },
      { title: 'Nombre', dataIndex: 'columnName', key: 'columnName' },
      { title: 'Tipo', dataIndex: 'dataType', key: 'dataType' },
      { title: 'Nulo', dataIndex: 'isNullable', render: (val: boolean) => val ? 'Sí' : 'No' },
      { title: 'PK', dataIndex: 'isPrimaryKey', render: (val: boolean) => val ? 'Sí' : 'No' },
      { title: 'FK', dataIndex: 'isForeignKey', render: (val: boolean) => val ? 'Sí' : 'No' },
      {
        title: 'Descripción',
        dataIndex: 'description',
        render: (text: string, record: any, index: number) => 
          isEditing ? (
            <Input.TextArea
              value={text || ''}
              onChange={(e) => handleColumnChange(tableIndex, index, e.target.value)}
              rows={2}
              placeholder="Descripción del campo..."
            />
          ) : (
            <span style={{ fontSize: '12px' }}>{text || 'Sin descripción'}</span>
          )
      }
    ];

    return (
      <Card
        key={table.tableName}
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>📋 {table.tableName}</span>
            <Space>
            <Button
              icon={isEditing ? <EyeOutlined /> : <EditOutlined />}
              onClick={() => setEditingTable(isEditing ? null : table.tableName)}
              type={isEditing ? "primary" : "default"}
              size="small"
            >
              {isEditing ? 'Vista' : 'Editar'}
            </Button>
                {/* ⬅️ NUEVO BOTÓN DE ELIMINAR */}
              <Button
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteTable(tableIndex, table.tableName)}
                type="text"
                danger
                size="small"
                title="Eliminar tabla del diccionario"
              >
                Eliminar
              </Button>
            </Space>
          </div>
        }
        style={{ marginBottom: 16 }}
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <strong>Descripción:</strong>
              {isEditing ? (
                <Input.TextArea
                  value={table.tableDescription || ''}
                  onChange={(e) => handleTableChange(tableIndex, 'tableDescription', e.target.value)}
                  rows={3}
                  placeholder="Descripción de la tabla..."
                  style={{ marginTop: 8 }}
                />
              ) : (
                <p style={{ margin: '8px 0', color: '#666', fontSize: '14px' }}>
                  {table.tableDescription || 'Sin descripción'}
                </p>
              )}
            </div>
            <div>
              <strong>Propósito:</strong>
              {isEditing ? (
                <Input.TextArea
                  value={table.tablePurpose || ''}
                  onChange={(e) => handleTableChange(tableIndex, 'tablePurpose', e.target.value)}
                  rows={3}
                  placeholder="Propósito de la tabla..."
                  style={{ marginTop: 8 }}
                />
              ) : (
                <p style={{ margin: '8px 0', color: '#666', fontSize: '14px' }}>
                  {table.tablePurpose || 'Sin propósito definido'}
                </p>
              )}
            </div>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={table.columns.map((col: any, index: number) => ({
            ...col,
            key: `${table.tableName}-${col.columnName}-${index}`
          }))}
          pagination={false}
          size="small"
          scroll={{ x: 800 }}
        />
      </Card>
    );
  };

  const tabItems = [
        {
      key: 'er-diagram', // ⬅️ NUEVA TAB PARA EL DIAGRAMA
      label: '🔗 Diagrama ER',
      children: (
        <div style={{ height: '700px', width: '100%' }}>
          <ERDiagram tables={preview.tables || []} />
        </div>
      )
    },
    {
      key: 'config',
      label: '⚙️ Configuración',
      children: (
        <Card title="Configuración del Documento">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label><strong>Título:</strong></label>
              <Input
                value={preview.metadata.title}
                onChange={(e) => handleMetadataChange('title', e.target.value)}
                placeholder="Título del documento"
                style={{ marginTop: 8 }}
              />
            </div>
            <div>
              <label><strong>Descripción:</strong></label>
              <Input.TextArea
                value={preview.metadata.description}
                onChange={(e) => handleMetadataChange('description', e.target.value)}
                placeholder="Descripción general"
                rows={3}
                style={{ marginTop: 8 }}
              />
            </div>
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: '16px' }}>
            <Checkbox
              checked={preview.metadata.includeDML}
              onChange={(e) => handleMetadataChange('includeDML', e.target.checked)}
            >
              Incluir DML (Inserts)
            </Checkbox>
            <Checkbox
              checked={preview.metadata.includeDDL}
              onChange={(e) => handleMetadataChange('includeDDL', e.target.checked)}
            >
              Incluir DDL (Create Tables)
            </Checkbox>
            <Checkbox
              checked={preview.metadata.includeStoredProcedures}
              onChange={(e) => handleMetadataChange('includeStoredProcedures', e.target.checked)}
            >
              Incluir Procedimientos
            </Checkbox>
          </div>
          {/* ⬅️ NUEVA SECCIÓN: Gestión de Tablas */}
          <div style={{ marginTop: 24, padding: 16, backgroundColor: '#f8f9fa', borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>Gestión de Tablas</strong>
                <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>
                  Tablas incluidas: {preview.tables?.length || 0} 
                  {initialPreview.tables.length !== preview.tables?.length && 
                    ` (${initialPreview.tables.length - preview.tables.length} eliminadas)`
                  }
                </p>
              </div>
              <Button
                onClick={handleRestoreAllTables}
                type="outline"
                size="small"
                disabled={initialPreview.tables.length === preview.tables?.length}
              >
                Restaurar Todas
              </Button>
            </div>
          </div>
        </Card>
        
      )
    },
    {
      key: 'tables',
      label: `📊 Tablas (${preview.tables?.length || 0})`,
      children: (
        <div>
          {preview.tables?.map((table: any, index: number) => renderTableCard(table, index))}
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>📄 Vista Previa del Diccionario</h2>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
            Atrás
          </Button>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExport}
            loading={loading}
            size="large"
          >
            Exportar PDF
          </Button>
        </Space>
      </div>

      <Tabs items={tabItems} defaultActiveKey="tables" />
    </div>
  );
};