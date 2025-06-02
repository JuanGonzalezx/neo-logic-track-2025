import React from 'react'
import {
  Card,
  Tag,
  Button,
  Space,
  Form,
  Input,
  Typography,
  notification,
  Select,
  Drawer,
  Row,
  Col,
  Divider,
  Empty,

} from 'antd';
import {
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FilterOutlined,
  ReloadOutlined,
  CalendarOutlined,
  ShopOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  ShoppingCartOutlined,
  InfoCircleOutlined,
  MailOutlined
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import styles from './ListadoRepartidores.module.css';
import { getAllUsers } from '../../../api/user';
import { orderAPI } from '../../../api/order';
import { getAllCiudades } from '../../../api/ciudad';

const { Title, Text } = Typography;

const REPARTIDOR_ROLE_ID = '68146313ef7752d9d59866da';



const ListadoRepartidores = () => {
  const [repartidores, setRepartidores] = useState([]);
  const [filteredRepartidores, setFilteredRepartidores] = useState([]);
  const [pedidosDisponibles, setPedidosDisponibles] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [repartidorSeleccionado, setRepartidorSeleccionado] = useState(null);
  const [activoFilter, setActivoFilter] = useState(null);
  const [entregasHoyFilter, setEntregasHoyFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch repartidores, orders, and cities from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all cities
        const ciudadesRes = await getAllCiudades();
        let ciudadesData = [];
        if (ciudadesRes.status === 200 && Array.isArray(ciudadesRes.data)) {
          ciudadesData = ciudadesRes.data;
        }

        // Fetch repartidores (users with repartidor role)
        const usersRes = await getAllUsers();
        let repartidoresData = [];
        if (usersRes.status === 200 && Array.isArray(usersRes.data)) {
          repartidoresData = usersRes.data
            .filter(u => u.roleId === REPARTIDOR_ROLE_ID)
            .map(u => {
              // Buscar ciudad por id
              let ciudadNombre = '';
              if (u.ciudadId) {
                const ciudadObj = ciudadesData.find(c => c.id === u.ciudadId || c._id === u.ciudadId);
                ciudadNombre = ciudadObj ? ciudadObj.nombre : '';
              } else if (u.ciudad && typeof u.ciudad === 'object') {
                ciudadNombre = u.ciudad.nombre;
              } else if (typeof u.ciudad === 'string') {
                ciudadNombre = u.ciudad;
              }
              return {
                id: u.id,
                nombre: u.fullname,
                email: u.email,
                ciudad: ciudadNombre,
                activo: u.status === 'ACTIVE' || u.activo === true,
                pedidosPendientes: 0, // Will be calculated below
                pedidosHoy: 0, // Will be calculated below
                telefono: u.number || '',
              };
            });
        }

        // Fetch orders
        const ordersRes = await orderAPI.getAllOrders();
        let pedidosData = [];
        if (ordersRes.status === 200 && Array.isArray(ordersRes.data)) {
          pedidosData = ordersRes.data
            .filter(o => o.status !== 'CANCELLED') // Filtrar canceladas
            .map(o => ({
              id: o.id,
              cliente: o.customer_name,
              direccion: o.delivery_address,
              ciudad: o.ciudad || (o.coordinate && o.coordinate.city?.nombre) || '',
              fechaEntrega: o.fecha_entrega || o.fechaEntrega || (o.creation_date && o.creation_date.split('T')[0]) || '',
              delivery_id: o.delivery_id,
              delivery_name: o.delivery_name,
              delivery_email: o.delivery_email,
              almacen_id: o.id_almacen, // <-- Agrega el id del almacén
              status: o.status,
            }));
        }

        // Calculate pedidosPendientes and pedidosHoy for each repartidor
        const today = new Date().toISOString().split('T')[0];
        repartidoresData = repartidoresData.map(rep => {
          const pendientes = pedidosData.filter(p => p.delivery_id === rep.id && p.status !== 'DELIVERED');
          const hoy = pendientes.filter(p => p.fechaEntrega === today);
          return {
            ...rep,
            pedidosPendientes: pendientes.length,
            pedidosHoy: hoy.length,
          };
        });

        setRepartidores(repartidoresData);
        setFilteredRepartidores(repartidoresData);
        setPedidosDisponibles(pedidosData);
      } catch (err) {
        notification.error({ message: 'Error cargando datos', description: err.message });
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = [...repartidores];

    // Filtrado por búsqueda de texto SOLO por nombre
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(rep =>
        rep.nombre && rep.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    // Filtrar por estado activo/inactivo
    if (activoFilter !== null) {
      filtered = filtered.filter(rep => rep.activo === activoFilter);
    }
    // Filtrar por entregas de hoy
    if (entregasHoyFilter !== null) {
      if (entregasHoyFilter) {
        filtered = filtered.filter(rep => rep.pedidosHoy > 0);
      } else {
        filtered = filtered.filter(rep => rep.pedidosHoy === 0);
      }
    }
    setFilteredRepartidores(filtered);
    // Reinicia la página al filtrar
    setCardPage(1);
  }, [repartidores, activoFilter, entregasHoyFilter, searchTerm]);

  // Mostrar Drawer con pedidos disponibles para el repartidor seleccionado
  const showAsignarPedidoDrawer = (repartidor) => {
    if (!repartidor.activo) {
      notification.warning({
        message: 'Repartidor Inactivo',
        description: 'No se pueden asignar pedidos a repartidores inactivos.',
      });
      return;
    }
    console.log('Repartidor seleccionado:', repartidor); // <-- LOGGING FOR DEBUGGING
    setRepartidorSeleccionado(repartidor);
    setDrawerVisible(true);
    setPedidoSeleccionado(null); // Limpiar selección anterior
  };

  // Seleccionar un pedido 
  const handleSelectPedido = (pedido) => {
    setPedidoSeleccionado(pedido);
  };

  // Manejar la asignación del pedido
  const handleAsignarPedido = async () => {
    if (!pedidoSeleccionado) {
      notification.error({
        message: 'Error',
        description: 'Por favor seleccione un pedido para asignar.',
      });
      return;
    }

    try {
      // Actualizar la orden en backend para asignar el repartidor
      const updateRes = await orderAPI.updateOrder(pedidoSeleccionado.id, {
        delivery_id: repartidorSeleccionado.id,
        delivery_name: repartidorSeleccionado.nombre,
        delivery_email: repartidorSeleccionado.email,
        status: 'ASSIGNED', // O el estado que corresponda
      });
      if (updateRes.status === 200 || updateRes.status === 201) {
        // Refrescar datos desde backend para mantener consistencia
        const ordersRes = await orderAPI.getAllOrders();
        let pedidosData = [];
        if (ordersRes.status === 200 && Array.isArray(ordersRes.data)) {
          pedidosData = ordersRes.data
            .filter(o => o.status !== 'CANCELLED') // Filtrar canceladas
            .map(o => ({
              id: o.id,
              cliente: o.customer_name,
              direccion: o.delivery_address,
              ciudad: o.ciudad || (o.coordinate && o.coordinate.city?.nombre) || '',
              fechaEntrega: o.fecha_entrega || o.fechaEntrega || (o.creation_date && o.creation_date.split('T')[0]) || '',
              delivery_id: o.delivery_id,
              delivery_name: o.delivery_name,
              delivery_email: o.delivery_email,
              almacen_id: o.id_almacen, // <-- Agrega el id del almacén
              status: o.status,
            }));
        }
        setPedidosDisponibles(pedidosData);
        setDrawerVisible(false);
        setPedidoSeleccionado(null);
        notification.success({
          message: 'Pedido Asignado',
          description: `Pedido #${pedidoSeleccionado.id} asignado a ${repartidorSeleccionado.nombre} exitosamente.`,
        });
      } else {
        notification.error({
          message: 'Error al asignar pedido',
          description: updateRes.message || 'No se pudo asignar el pedido.',
        });
      }
    } catch (err) {
      notification.error({
        message: 'Error al asignar pedido',
        description: err.message || 'No se pudo asignar el pedido.',
      });
    }
  };

  const toggleEstadoRepartidor = (repartidor) => {
    const updatedRepartidores = repartidores.map(rep => {
      if (rep.id === repartidor.id) {
        return { ...rep, activo: !rep.activo };
      }
      return rep;
    });

    setRepartidores(updatedRepartidores);

    notification.success({
      message: 'Estado Actualizado',
      description: `${repartidor.nombre} ahora está ${!repartidor.activo ? 'activo' : 'inactivo'}.`,
    });
  };

  const resetFilters = () => {
    setActivoFilter(null);
    setEntregasHoyFilter(null);
    setSearchTerm("");
  };

  const renderPedidoCard = (pedido) => {
    const fechaHoy = new Date().toISOString().split('T')[0];
    const esHoy = pedido.fechaEntrega === fechaHoy;
    const isSelected = pedidoSeleccionado && pedidoSeleccionado.id === pedido.id;

    return (
      <Card
        key={pedido.id}
        style={{
          marginBottom: '16px',
          cursor: 'pointer',
          border: isSelected ? '2px solid #1890ff' : '1px solid #f0f0f0',
          boxShadow: isSelected ? '0 2px 8px rgba(24, 144, 255, 0.3)' : 'none'
        }}
        hoverable
        onClick={() => handleSelectPedido(pedido)}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div>
            <Tag color="blue">Pedido #{pedido.id}</Tag>
            {esHoy && <Tag color="red">HOY</Tag>}
          </div>
          {isSelected && <Tag color="green">Seleccionado</Tag>}
        </div>

        <p><strong>Cliente:</strong> {pedido.cliente}</p>
        <p><EnvironmentOutlined /> <strong>Dirección:</strong> {pedido.direccion}</p>
        <p><CalendarOutlined /> <strong>Fecha Entrega:</strong> {pedido.fechaEntrega}</p>

        <Divider style={{ margin: '10px 0' }} />
        <div style={{ backgroundColor: '#fafafa', padding: '10px', borderRadius: '4px' }}>
          <p style={{ margin: 0 }}>
            <ShopOutlined /> <strong>Almacén ID:</strong> {pedido.almacen_id || 'Sin almacén'}
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
            <PhoneOutlined /> {pedido.almacen?.telefono || ''} • <UserOutlined /> {pedido.almacen?.contacto || ''}
          </p>
        </div>
      </Card>
    );
  };

  // Hook para detectar si es móvil
  function useIsMobile(breakpoint = 600) {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= breakpoint);
    useEffect(() => {
      const handleResize = () => setIsMobile(window.innerWidth <= breakpoint);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, [breakpoint]);
    return isMobile;
  }

  const isMobile = useIsMobile();

  // Card para repartidor en móvil
  const renderDeliveryCard = (rep) => (
    <Card key={rep.id} style={{ marginBottom: 12, borderRadius: 10, boxShadow: '0 2px 8px #e3e3e3' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
        <UserOutlined style={{ fontSize: 22, color: '#1976d2', marginRight: 10 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <b style={{ wordBreak: 'break-all' }}>{rep.nombre}</b>
          <div style={{ fontSize: 13, color: '#888', wordBreak: 'break-all' }}>{rep.email}</div>
        </div>
        {rep.activo ? <Tag color="green">Activo</Tag> : <Tag color="red">Inactivo</Tag>}
      </div>
      <div style={{ fontSize: 13, marginBottom: 4, wordBreak: 'break-all' }}>
        <b>ID:</b> <span style={{ color: '#1976d2' }}>{rep.id}</span><br />
        <PhoneOutlined /> <b>Tel:</b> {rep.telefono || '-'}<br />
        <EnvironmentOutlined /> <b>Ciudad:</b> {rep.ciudad || '-'}
      </div>
      <div style={{ display: 'flex', gap: 8, margin: '8px 0', flexWrap: 'wrap' }}>
        <Tag color={rep.pedidosPendientes > 0 ? 'blue' : 'default'}>
          <ShoppingCartOutlined /> Pendientes: {rep.pedidosPendientes}
        </Tag>
        <Tag color={rep.pedidosHoy > 0 ? 'orange' : 'default'}>
          <CalendarOutlined /> Hoy: {rep.pedidosHoy}
        </Tag>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <Button
          type="primary"
          size="small"
          onClick={() => showAsignarPedidoDrawer(rep)}
          disabled={!rep.activo}
          icon={<ShoppingCartOutlined />}
          style={{ flex: 1 }}
        >
          Asignar
        </Button>
        <Button
          type={rep.activo ? "danger" : "primary"}
          size="small"
          onClick={() => toggleEstadoRepartidor(rep)}
          icon={rep.activo ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
          style={{ flex: 1 }}
        >
          {rep.activo ? 'Desactivar' : 'Activar'}
        </Button>
      </div>
    </Card>
  );

  // Paginación para cards (ahora en todas las vistas)
  const [cardPage, setCardPage] = useState(1);
  // Ajusta la cantidad de cards por página según el tamaño de pantalla
  const cardPageSize = isMobile ? 6 : 8; // 6 en móvil, 8 en desktop para evitar superposición
  const paginatedRepartidores = filteredRepartidores.slice((cardPage-1)*cardPageSize, cardPage*cardPageSize);
  const totalPages = Math.ceil(filteredRepartidores.length / cardPageSize);

  return (
    <div className={styles['repartidores-bg']}>
      <Card className={styles['repartidores-card']}>
        <Title level={2} className={styles['repartidores-title']}>Listado de Repartidores</Title>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Title level={4}>Gestión de Repartidores</Title>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={resetFilters}>
                Resetear Filtros
              </Button>
            </Space>
          </Space>

          <Space style={{ marginBottom: '16px', width: '100%', flexWrap: 'wrap' }}>
            <Input.Search
              placeholder="Buscar repartidor..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: 250 }}
            />
            <Text strong><FilterOutlined /> Filtros:</Text>
            <Select
              placeholder="Estado"
              style={{ width: 120 }}
              onChange={value => setActivoFilter(value)}
              value={activoFilter}
              allowClear
            >
              <Select.Option value={true}>Activo</Select.Option>
              <Select.Option value={false}>Inactivo</Select.Option>
            </Select>
            <Select
              placeholder="Entregas Hoy"
              style={{ width: 150 }}
              onChange={value => setEntregasHoyFilter(value)}
              value={entregasHoyFilter}
              allowClear
            >
              <Select.Option value={true}>Con entregas hoy</Select.Option>
              <Select.Option value={false}>Sin entregas hoy</Select.Option>
            </Select>
          </Space>

          <div className={styles['repartidores-table']} style={{ width: '100%', overflow: 'visible' }}>
            {paginatedRepartidores.length === 0 ? (
              <Empty description="No hay repartidores" />
            ) : (
              <Row gutter={[0, 24]} style={{ width: '100%', margin: 0 }} justify="center" align="top">
                {paginatedRepartidores.map(rep => (
                  <Col
                    key={rep.id}
                    xs={24}
                    sm={24}
                    md={12}
                    lg={8}
                    xl={6}
                    xxl={4}
                    style={{ display: 'flex', justifyContent: 'center', alignItems: 'stretch', margin: 0, padding: 0, minWidth: 220, maxWidth: 340 }}
                  >
                    <div style={{ width: 280, minWidth: 220, maxWidth: 340, flex: 1, display: 'flex', alignItems: 'stretch' }}>
                      {renderDeliveryCard(rep)}
                    </div>
                  </Col>
                ))}
              </Row>
            )}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
                <Button
                  size="small"
                  disabled={cardPage === 1}
                  onClick={() => setCardPage(cardPage-1)}
                  style={{ marginRight: 8 }}
                >Anterior</Button>
                <span style={{ alignSelf: 'center', fontSize: 13 }}>
                  Página {cardPage} de {totalPages}
                </span>
                <Button
                  size="small"
                  disabled={cardPage === totalPages}
                  onClick={() => setCardPage(cardPage+1)}
                  style={{ marginLeft: 8 }}
                >Siguiente</Button>
              </div>
            )}
          </div>
        </Space>
      </Card>
      <Drawer 
        title={`Asignar Pedido a ${repartidorSeleccionado ? repartidorSeleccionado.nombre : ''}`}
        width={window.innerWidth < 600 ? '100vw' : 650}
        placement="right"
        onClose={() => {
          setDrawerVisible(false);
          setPedidoSeleccionado(null);
        }}
        open={drawerVisible}
        extra={
          <Space>
            <Button onClick={() => {
              setDrawerVisible(false);
              setPedidoSeleccionado(null);
            }}>
              Cancelar
            </Button>
            <Button 
              type="primary" 
              onClick={handleAsignarPedido}
              disabled={!pedidoSeleccionado}
            >
              Asignar Pedido
            </Button>
          </Space>
        }
      >
        {repartidorSeleccionado && (
          <>
            <Card style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
                <UserOutlined style={{ fontSize: '24px', marginRight: '10px' }} />
                <div>
                  <Typography.Title level={5} style={{ margin: 0 }}>{repartidorSeleccionado.nombre}</Typography.Title>
                  <Typography.Text type="secondary">{repartidorSeleccionado.telefono}</Typography.Text>
                </div>
              </div>
              <Divider style={{ margin: '10px 0' }} />
              <p><EnvironmentOutlined /> <strong>Ciudad:</strong> {repartidorSeleccionado.ciudad}</p>
              <Space>
                <Tag color="blue">Pedidos Pendientes: {repartidorSeleccionado.pedidosPendientes}</Tag>
                <Tag color="orange">Entregas Hoy: {repartidorSeleccionado.pedidosHoy}</Tag>
              </Space>
            </Card>
            <Typography.Title level={5}>
              <Space>
                <ShoppingCartOutlined />
                Pedidos Disponibles
              </Space>
            </Typography.Title>
            <div style={{ marginBottom: '16px' }}>
              <Row>
                <Col span={24}>
                  <Typography.Text type="secondary">
                    <InfoCircleOutlined /> Selecciona el pedido que deseas asignar a este repartidor
                  </Typography.Text>
                </Col>
              </Row>
            </div>
            <div style={{ maxHeight: window.innerWidth < 600 ? '40vh' : '50vh', overflowY: 'auto' }}>
              {pedidosDisponibles.length > 0 ? (
                pedidosDisponibles.map(pedido => renderPedidoCard(pedido))
              ) : (
                <Empty description="No hay pedidos disponibles" />
              )}
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
}

// Mejoras de responsividad
// Agrega media queries y estilos responsivos
// ...

export default ListadoRepartidores;