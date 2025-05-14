// src/api/product.js
// Se comenta axiosInstance ya que no se usará para los mocks.
// import axiosInstance from './axiosInstance';

// URLs base (no se usarán activamente con los mocks, pero se dejan por referencia)
// const API_URL = '/products';
// const CATEGORIES_URL = '/categories';
// const PROVIDERS_URL = '/providers';

// --- MOCK DATA ---
const mockCategoriesData = [
  { id_categoria_producto: 1, id: 1, nombre_categoria: 'Electrónicos', name: 'Electrónicos', descripcion_categoria: 'Dispositivos y accesorios electrónicos' },
  { id_categoria_producto: 2, id: 2, nombre_categoria: 'Libros', name: 'Libros', descripcion_categoria: 'Libros de diversas temáticas' },
  { id_categoria_producto: 3, id: 3, nombre_categoria: 'Hogar y Cocina', name: 'Hogar y Cocina', descripcion_categoria: 'Artículos para el hogar y la cocina' },
  { id_categoria_producto: 4, id: 4, nombre_categoria: 'Ropa y Accesorios', name: 'Ropa y Accesorios', descripcion_categoria: 'Vestimenta y complementos de moda' },
];

const mockProvidersData = [
  { id_proveedor: 21, id: 21, nombre_proveedor: 'ElectroTech Distribuidores', name: 'ElectroTech Distribuidores', contacto_proveedor: 'Juan Pérez', email_proveedor: 'ventas@electrotech.com', telefono_proveedor: '555-1234' },
  { id_proveedor: 22, id: 22, nombre_proveedor: 'Editorial MundoLibro', name: 'Editorial MundoLibro', contacto_proveedor: 'Ana Gómez', email_proveedor: 'pedidos@mundolibro.es', telefono_proveedor: '555-5678' },
  { id_proveedor: 23, id: 23, nombre_proveedor: 'HogarTotal S.A.', name: 'HogarTotal S.A.', contacto_proveedor: 'Carlos López', email_proveedor: 'info@hogartotal.com', telefono_proveedor: '555-8765' },
  { id_proveedor: 24, id: 24, nombre_proveedor: 'ModaGlobal Co.', name: 'ModaGlobal Co.', contacto_proveedor: 'Laura Torres', email_proveedor: 'contacto@modaglobal.com', telefono_proveedor: '555-4321' },
];

// Usamos 'let' para poder modificarlo con create, update, delete
let mockProductsData = [
  {
    id_producto: 101,
    id: 101, // Añadido para consistencia con lo que esperan los componentes
    nombre_producto: 'Laptop Gamer Pro X',
    descripcion_producto: 'Laptop de alto rendimiento para gaming con tarjeta gráfica dedicada y procesador de última generación.',
    precio_producto: 1250.99,
    id_categoria_producto: 1,
    stock_disponible_producto: 15,
    unidad_medida_producto: 'unidad',
    id_proveedor_producto: 21,
    codigo_barras_producto: '7890123456789',
    estado_producto: 'activo',
    imagen_producto_url: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=LaptopGamer',
  },
  {
    id_producto: 102,
    id: 102,
    nombre_producto: 'Libro: "El Gran Viaje"',
    descripcion_producto: 'Una novela de aventuras y misterio que te atrapará desde la primera página.',
    precio_producto: 22.50,
    id_categoria_producto: 2,
    stock_disponible_producto: 50,
    unidad_medida_producto: 'unidad',
    id_proveedor_producto: 22,
    codigo_barras_producto: '7891234567890',
    estado_producto: 'activo',
    imagen_producto_url: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=ElGranViaje',
  },
  {
    id_producto: 103,
    id: 103,
    nombre_producto: 'Cafetera Express Automática',
    descripcion_producto: 'Prepara deliciosos cafés en casa con esta cafetera automática de fácil uso.',
    precio_producto: 89.90,
    id_categoria_producto: 3,
    stock_disponible_producto: 30,
    unidad_medida_producto: 'unidad',
    id_proveedor_producto: 23,
    codigo_barras_producto: '7892345678901',
    estado_producto: 'inactivo',
    imagen_producto_url: 'https://via.placeholder.com/150/00FF00/FFFFFF?text=Cafetera',
  },
  {
    id_producto: 104,
    id: 104,
    nombre_producto: 'Auriculares Bluetooth SoundMax',
    descripcion_producto: 'Auriculares inalámbricos con cancelación de ruido y batería de larga duración.',
    precio_producto: 75.00,
    id_categoria_producto: 1,
    stock_disponible_producto: 25,
    unidad_medida_producto: 'unidad',
    id_proveedor_producto: 21,
    codigo_barras_producto: '7893456789012',
    estado_producto: 'descontinuado',
    imagen_producto_url: 'https://via.placeholder.com/150/FFFF00/000000?text=Auriculares',
  },
  {
    id_producto: 105,
    id: 105,
    nombre_producto: 'Camiseta Básica Algodón',
    descripcion_producto: 'Camiseta de algodón suave y cómoda, ideal para el día a día.',
    precio_producto: 15.99,
    id_categoria_producto: 4,
    stock_disponible_producto: 120,
    unidad_medida_producto: 'unidad',
    id_proveedor_producto: 24,
    codigo_barras_producto: '7894567890123',
    estado_producto: 'activo',
    imagen_producto_url: 'https://via.placeholder.com/150/FFC0CB/000000?text=Camiseta',
  }
];
// --- FIN MOCK DATA ---

const simulateDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getAllProducts = async () => {
  console.log("MOCK API: getAllProducts called");
  await simulateDelay(500); // Simula retraso de red
  try {
    // Devolvemos una copia para evitar mutaciones directas no deseadas fuera de las funciones mock.
    return { status: 200, data: [...mockProductsData], message: "Productos obtenidos (mock)" };
  } catch (error) {
    console.error("MOCK API Error getAllProducts:", error.message);
    return { status: 500, data: null, message: "Error al obtener productos (mock)" };
  }
};

export const createProduct = async (productData) => {
  console.log("MOCK API: createProduct called with", productData);
  await simulateDelay(500);
  try {
    const newId = Math.max(0, ...mockProductsData.map(p => p.id_producto || p.id)) + 1;
    const newProduct = {
      ...productData,
      id_producto: newId,
      id: newId, // Aseguramos que 'id' también esté presente
    };
    mockProductsData.push(newProduct);
    // La respuesta de creación a menudo devuelve el objeto creado.
    // La estructura original era { status, data, message: response.data.message || "Producto creado" }
    // Asumimos que response.data es el producto, y podría tener un campo message.
    // Para el mock, el producto es 'newProduct' y el mensaje es fijo.
    return { status: 201, data: newProduct, message: "Producto creado exitosamente (mock)" };
  } catch (error) {
    console.error("MOCK API Error createProduct:", error.message);
    return { status: 500, data: null, message: "Error al crear producto (mock)" };
  }
};

export const updateProduct = async (productId, productData) => {
  console.log("MOCK API: updateProduct called for ID", productId, "with", productData);
  await simulateDelay(500);
  try {
    const productIndex = mockProductsData.findIndex(p => (p.id_producto || p.id) === productId);
    if (productIndex > -1) {
      mockProductsData[productIndex] = {
        ...mockProductsData[productIndex],
        ...productData,
        // Aseguramos que los IDs no se sobreescriban incorrectamente si no vienen en productData
        id_producto: mockProductsData[productIndex].id_producto || mockProductsData[productIndex].id,
        id: mockProductsData[productIndex].id || mockProductsData[productIndex].id_producto,
      };
      // La respuesta de actualización a menudo devuelve el objeto actualizado.
      return { status: 200, data: mockProductsData[productIndex], message: "Producto actualizado exitosamente (mock)" };
    } else {
      return { status: 404, data: null, message: "Producto no encontrado para actualizar (mock)" };
    }
  } catch (error) {
    console.error("MOCK API Error updateProduct:", error.message);
    return { status: 500, data: null, message: "Error al actualizar producto (mock)" };
  }
};

export const deleteProduct = async (productId) => {
  console.log("MOCK API: deleteProduct called for ID", productId);
  await simulateDelay(500);
  try {
    const initialLength = mockProductsData.length;
    mockProductsData = mockProductsData.filter(p => (p.id_producto || p.id) !== productId);
    if (mockProductsData.length < initialLength) {
      // La respuesta de borrado a menudo solo devuelve un mensaje o status.
      return { status: 200, message: "Producto eliminado exitosamente (mock)" };
    } else {
      return { status: 404, message: "Producto no encontrado para eliminar (mock)" };
    }
  } catch (error) {
    console.error("MOCK API Error deleteProduct:", error.message);
    return { status: 500, message: "Error al eliminar producto (mock)" };
  }
};

// --- Funciones para Dependencias (Categorías, Proveedores) ---
export const getAllCategories = async () => {
  console.log("MOCK API: getAllCategories called");
  await simulateDelay(300);
  try {
    // La estructura original era: return { status: response.status, data: response.data };
    // Devolvemos una copia
    return { status: 200, data: [...mockCategoriesData] };
  } catch (error) {
    console.error("MOCK API Error getAllCategories:", error.message);
    return { status: 500, data: [], message: "Error al obtener categorías (mock)" };
  }
};

export const getAllProviders = async () => {
  console.log("MOCK API: getAllProviders called");
  await simulateDelay(400);
  try {
    // La estructura original era: return { status: response.status, data: response.data };
    // Devolvemos una copia
    return { status: 200, data: [...mockProvidersData] };
  } catch (error) {
    console.error("MOCK API Error getAllProviders:", error.message);
    return { status: 500, data: [], message: "Error al obtener proveedores (mock)" };
  }
};