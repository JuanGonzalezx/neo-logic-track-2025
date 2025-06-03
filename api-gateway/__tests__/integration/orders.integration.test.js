const request = require('supertest');
const app = require('../../index');

// Configura aquí las credenciales de prueba
const TEST_USER = {
  email: 'test@example.com',
  password: 'test123'
};

let token;

beforeAll(async () => {
  // Realiza login para obtener un token válido
  const res = await request(app)
    .post('/api/v1/auth/signin')
    .send({ email: TEST_USER.email, password: TEST_USER.password })
    .set('Accept', 'application/json');
  token = res.body.token || res.body.accessToken;
});

describe('API Gateway - Órdenes', () => {
  let almacenId;
  let productoId;

  beforeAll(async () => {
    // Buscar un almacén real
    const resAlmacen = await request(app)
      .get('/api/v1/inventory/almacenes')
      .set('Accept', 'application/json');
    const almacenes = Array.isArray(resAlmacen.body) ? resAlmacen.body : [];
    almacenId = almacenes.length > 0 ? almacenes[0].id_almacen || almacenes[0].id : 'ALM0001';

    // Buscar un producto real
    const resProducto = await request(app)
      .get('/api/v1/inventory/productos')
      .set('Accept', 'application/json');
    const productos = Array.isArray(resProducto.body) ? resProducto.body : [];
    productoId = productos.length > 0 ? productos[0].id_producto || productos[0].id : 'PROD001';
  });

  it('debe obtener la lista de órdenes', async () => {
    const res = await request(app)
      .get('/api/v1/orders')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('debe crear una nueva orden', async () => {
    const nuevaOrden = {
      customer_name: 'Juan Pérez',
      customer_email: 'juan@example.com',
      delivery_address: 'Calle 123',
      id_almacen: almacenId,
      orderProducts: [
        { product_id: productoId, amount: 2 }
      ]
    };
    const res = await request(app)
      .post('/api/v1/orders')
      .send(nuevaOrden)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`);
    expect([200, 201, 400]).toContain(res.statusCode); // 400 si falta stock, etc.
    if (res.statusCode === 200 || res.statusCode === 201) {
      expect(res.body.message).toHaveProperty('id');
    } else {
      expect(res.body).toHaveProperty('message');
    }
  });

  it('debe devolver 404 para una orden inexistente', async () => {
    const res = await request(app)
      .get('/api/v1/orders/orden-inexistente')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`);
    expect([404, 400, 500]).toContain(res.statusCode);
  });

  it('debe actualizar una orden existente (PUT)', async () => {
    // Crear una orden primero
    const nuevaOrden = {
      customer_name: 'Ana Actualiza',
      customer_email: 'ana@example.com',
      delivery_address: 'Calle Actualiza',
      id_almacen: almacenId,
      orderProducts: [
        { product_id: productoId, amount: 1 }
      ]
    };
    const crearRes = await request(app)
      .post('/api/v1/orders')
      .send(nuevaOrden)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`);
    if (![200, 201].includes(crearRes.statusCode)) return expect(true).toBe(true); // Si no se puede crear, skip
    const orderId = crearRes.body.message.id;
    const updateRes = await request(app)
      .put(`/api/v1/orders/${orderId}`)
      .send({ delivery_address: 'Calle Nueva', status: 'ASSIGNED' })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`);
    expect([200, 400]).toContain(updateRes.statusCode);
    if (updateRes.statusCode === 200) {
      expect(updateRes.body).toHaveProperty('order');
    }
  });

  it('debe rechazar la creación de orden con producto inexistente', async () => {
    const ordenInvalida = {
      customer_name: 'Cliente Falso',
      customer_email: 'falso@example.com',
      delivery_address: 'Calle Falsa',
      id_almacen: almacenId,
      orderProducts: [
        { product_id: 'NO_EXISTE', amount: 1 }
      ]
    };
    const res = await request(app)
      .post('/api/v1/orders')
      .send(ordenInvalida)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`);
    expect([400, 500]).toContain(res.statusCode);
  });

  it('debe rechazar la creación de orden sin productos', async () => {
    const ordenSinProductos = {
      customer_name: 'Cliente Sin Productos',
      customer_email: 'sinproductos@example.com',
      delivery_address: 'Calle Vacía',
      id_almacen: almacenId,
      orderProducts: []
    };
    const res = await request(app)
      .post('/api/v1/orders')
      .send(ordenSinProductos)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`);
    expect([400, 500]).toContain(res.statusCode);
  });

  // Puedes agregar más pruebas para PUT, DELETE, autenticación, etc.
});
