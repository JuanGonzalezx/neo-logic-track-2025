// src/services/ProductoService.js
const fs = require('fs');
const csv = require('csv-parser');
const { v4: uuidv4 } = require('uuid');
let pLimit;
(async () => {
  pLimit = (await import('p-limit')).default;
})();
const path = require('path');
const { PrismaClient, Tipo } = require('@prisma/client');
const prisma = new PrismaClient();
const CategoriaService = require('../services/CategoriaService');
const ProveedorService = require('../services/ProveedorService');
const ProveedorProductoService = require('../services/ProveedorProductoService');
const AlmacenService = require('../services/AlmacenService');
const AlmacenProductoService = require('../services/AlmacenProductoService');
const MovementInventoryService = require('../services/MovementInventoryService');


function createLogStream() {
  const logsDir = path.join(__dirname, '../../logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  const now = new Date();
  const fileName = `products-log-${now.toISOString().split('T')[0]}.log`;
  const fullPath = path.join(logsDir, fileName);
  return fs.createWriteStream(fullPath, { flags: 'a' });
}
class ProductoService {

  _parseProductoData(csvData) {
    let {
      id_producto, id_almacen, nombre_producto, categoria,
      descripcion, sku, codigo_barras,
      precio_unitario, cantidad_stock, nivel_reorden, ultima_reposicion, fecha_vencimiento,
      id_proveedor, peso_kg, dimensiones_cm, es_fragil, requiere_refrigeracion, estado
    } = csvData;

    // Verificación de campos requeridos
    // Los campos booleanos (es_fragil, requiere_refrigeracion) y estado se verifican contra undefined
    // para distinguirlos de un valor explícito 'false' o un estado válido que podría ser falsy.
    if (!id_producto || !id_almacen || !nombre_producto || !categoria ||
      !descripcion || !sku || !codigo_barras || precio_unitario === undefined || cantidad_stock === undefined || // Verificar undefined para números que podrían ser 0
      nivel_reorden === undefined || !ultima_reposicion || !id_proveedor ||
      peso_kg === undefined || dimensiones_cm === undefined || es_fragil === undefined || requiere_refrigeracion === undefined ||
      estado === undefined) { // Si 'estado' puede ser un string vacío que es válido, ajustar esta condición
      // Nota: Si un campo numérico como precio_unitario puede ser 0 y es válido, entonces !precio_unitario sería problemático si precio_unitario es 0.
      // Es mejor verificar la presencia ( !== undefined ) o un valor específico si es necesario.
      // Para simplificar, asumiré que los campos numéricos deben tener un valor y no ser solo 0 si son "requeridos" en el sentido de "deben estar presentes y ser válidos".
      // La validación actual con `!variable` para números podría fallar si 0 es un valor válido pero se interpreta como "no presente".
      // Voy a mantener tu lógica original, pero ten esto en cuenta.
      // Una opción más robusta sería:
      // const requiredFields = ['id_producto', 'id_almacen', ...];
      // for (const field of requiredFields) {
      //   if (csvData[field] === undefined || csvData[field] === null || csvData[field] === '') { // Ajustar según lo que consideres "vacío"
      //     throw new Error(`El campo ${field} es requerido.`);
      //   }
      // }
      // Pero para mantenerlo simple y cercano a tu original:
      throw new Error("Todos los campos son requeridos. Verifica que todos los valores, incluidos los numéricos y booleanos, estén presentes.");
    }


    const parsedPrecio = parseFloat(precio_unitario);
    // No reasigno aquí, usaré parsedPrecio directamente para la validación y el retorno.
    const parsedCantidadStock = parseInt(cantidad_stock, 10);
    const parsedNivelReorden = parseInt(nivel_reorden, 10);

    if (isNaN(parsedPrecio) || isNaN(parsedCantidadStock) || isNaN(parsedNivelReorden)) {
      throw new Error("Precio unitario, cantidad stock, nivel reorden y dimension deben ser números válidos.");
    }

    // Devolvemos los valores parseados y los originales donde no hubo parseo o el parseo fue para validación.
    // Para mantener la estructura de reasignación implícita en tu código original,
    // puedes reasignar aquí si es crucial, pero es más limpio devolver los valores transformados.
    // Dado tu requisito de NO CAMBIAR NOMBRES, y que las variables son locales,
    // la reasignación que tenías está bien dentro de esta función.
    // Aquí, optaré por devolver un objeto con los valores procesados, que es una práctica común.
    // Si necesitas que las variables originales *dentro* de esta función reflejen el parseo, tu código original es correcto.

    return {
      id_producto, id_almacen, nombre_producto, categoria,
      descripcion, sku, codigo_barras,
      precio_unitario: parsedPrecio, // Usar valor parseado
      cantidad_stock: parsedCantidadStock, // Usar valor parseado
      nivel_reorden: parsedNivelReorden, // Usar valor parseado
      ultima_reposicion, fecha_vencimiento, // Estos se parsearán en `create`
      id_proveedor,
      peso_kg, // Asumo que peso_kg ya es numérico o se parseará después si es string. Si es string, parsear aquí.
      dimensiones_cm, // Usar valor parseado
      es_fragil, requiere_refrigeracion, estado // Estos son booleanos/estado, se usan como vienen del CSV
    };
    // Si necesitas mantener la reasignación a las variables con let:
    // precio_unitario = parsedPrecio;
    // cantidad_stock = parsedCantidadStock;
    // ... y luego retornar el objeto con los nombres de variable originales.
    // Tu código original para esto estaba bien.
  }

  async create(productoDataFromCSV) {
    let {
      id_producto, id_almacen, nombre_producto, categoria,
      descripcion, sku, codigo_barras,
      precio_unitario, cantidad_stock, nivel_reorden, ultima_reposicion, fecha_vencimiento,
      id_proveedor, peso_kg, dimensiones_cm, es_fragil, requiere_refrigeracion, estado
    } = this._parseProductoData(productoDataFromCSV);

    // Parseo de fechas
    if (typeof ultima_reposicion === 'string') {
      const partes_ultima_reposicion = ultima_reposicion.split('/');
      if (partes_ultima_reposicion.length === 3) {
        const dia_ur = parseInt(partes_ultima_reposicion[0], 10);
        const mes_ur = parseInt(partes_ultima_reposicion[1], 10) - 1;
        const anio_ur = parseInt(partes_ultima_reposicion[2], 10);
        ultima_reposicion = new Date(anio_ur, mes_ur, dia_ur);
        if (isNaN(ultima_reposicion.getTime())) {
          throw new Error(`Formato de fecha inválido para ultima_reposicion: ${productoDataFromCSV.ultima_reposicion}`);
        }
      } else {
        throw new Error(`Formato de fecha inválido para ultima_reposicion: ${productoDataFromCSV.ultima_reposicion}`);
      }
    } else if (!(ultima_reposicion instanceof Date && !isNaN(ultima_reposicion.getTime()))) {
      throw new Error(`Tipo o valor inválido para ultima_reposicion: ${productoDataFromCSV.ultima_reposicion}`);
    }

    if (fecha_vencimiento && typeof fecha_vencimiento === 'string') {
      const partes_fecha_vencimiento = fecha_vencimiento.split('/');
      if (partes_fecha_vencimiento.length === 3) {
        const dia_fv = parseInt(partes_fecha_vencimiento[0], 10);
        const mes_fv = parseInt(partes_fecha_vencimiento[1], 10) - 1;
        const anio_fv = parseInt(partes_fecha_vencimiento[2], 10);
        fecha_vencimiento = new Date(anio_fv, mes_fv, dia_fv);
        if (isNaN(fecha_vencimiento.getTime())) {
          throw new Error(`Formato de fecha inválido para fecha_vencimiento: ${productoDataFromCSV.fecha_vencimiento}`);
        }
      } else {
        throw new Error(`Formato de fecha inválido para fecha_vencimiento: ${productoDataFromCSV.fecha_vencimiento}`);
      }
    } else if (fecha_vencimiento === null || fecha_vencimiento === undefined || fecha_vencimiento === '') {
      fecha_vencimiento = null;
    } else if (fecha_vencimiento && !(fecha_vencimiento instanceof Date && !isNaN(fecha_vencimiento.getTime()))) {
      throw new Error(`Tipo o valor inválido para fecha_vencimiento: ${productoDataFromCSV.fecha_vencimiento}`);
    }

    return await prisma.$transaction(async (tx) => {
      // Iniciar operaciones independientes en paralelo
      const existingProductoPromise = tx.producto.findUnique({ where: { id_producto } });
      const categoriaEntityPromise = CategoriaService.findOrCreateCategoria({ nombre: categoria }, tx);
      const proveedorEntityPromise = ProveedorService.findOrCreateProveedor({ id: id_proveedor }, tx);
      const almacenEntityPromise = AlmacenService.getById(id_almacen, tx);

      const [
        existingProducto,
        categoriaEntity,
        proveedorEntity,
        almacenEntity
      ] = await Promise.all([
        existingProductoPromise,
        categoriaEntityPromise,
        proveedorEntityPromise,
        almacenEntityPromise
      ]);

      let categoriaData = categoriaEntity.id;
      let proveedorData = proveedorEntity.id;

      if (!almacenEntity) {
        throw new Error(`El almacen '${id_almacen}' no existe. Por favor, créelo primero.`);
      }

      let capacidad_usada_m3 = await this.calcularVolumen(dimensiones_cm);
      capacidad_usada_m3 = (capacidad_usada_m3*cantidad_stock) + almacenEntity.capacidad_usada_m3
      await AlmacenService.updateCapacidadm3(id_almacen, capacidad_usada_m3);

      // 5. Crear producto (si no existe) - Esta operación debe ser await y completarse ANTES de las dependientes

      // if (existingProducto.estado) {
      //   throw new Error(`El producto '${existingProducto.id_producto}' está fuera de linea.`)
      // }
      if (!existingProducto) {

        await tx.producto.create({
          data: {
            id_producto,
            nombre_producto,
            categoria_id: categoriaData,
            descripcion,
            sku,
            codigo_barras,
            precio_unitario,
            peso_kg,
            dimensiones_cm,
            es_fragil,
            requiere_refrigeracion,
            estado
          }
        });
      }

      // Ahora el producto está garantizado. Las siguientes operaciones pueden ser paralelas.
      const almacenProductoLogic = async () => {
        let almacenProductoData = {
          id_almacen,
          id_producto,
          cantidad_stock,
          nivel_reorden,
          ultima_reposicion,
          fecha_vencimiento
        };
        const existingAlmacenProducto = await AlmacenProductoService.getByProductoAlmacen(id_almacen, id_producto, tx);
        if (!existingAlmacenProducto) {
          await AlmacenProductoService.findOrCreateAlmacenProducto(almacenProductoData, tx);
        } else {
          almacenProductoData.cantidad_stock = almacenProductoData.cantidad_stock + existingAlmacenProducto.cantidad_stock;
          await AlmacenProductoService.update(existingAlmacenProducto.id, almacenProductoData, tx);
        }
      };

      const fecha_movimiento = new Date();
      const tipo_movimiento = true;
      const movementInventoryData = {
        id_producto,
        id_almacen,
        id_proveedor,
        tipo: tipo_movimiento,
        cantidad: cantidad_stock,
        fecha: fecha_movimiento
      };

      Promise.all([
        almacenProductoLogic(),
        MovementInventoryService.create(movementInventoryData, tx)
      ]);

      return { success: true, id_producto_procesado: id_producto };

    }, {
      timeout: 60000,
      maxWait: 60000
    });
  }

  async bulkCreateProductsFromCSV(filePath) {
  const startTime = Date.now();
  const results = [];
  const logStream = createLogStream();

  const log = (msg) => {
    const timestamp = `[${new Date().toISOString()}] `;
    console.log(timestamp + msg);
    logStream.write(timestamp + msg + "\n");
  };
  const appendLog = (msg) => {
    console.log(msg);
    logStream.write(msg + "\n");
  };

  // Función para calcular volumen unitario desde dimensiones_cm "LxAxH" en cm, retorna m3
  function calcularVolumen(dimensiones) {
    if (!dimensiones) return 0;
    const partes = dimensiones.split('x').map(p => parseFloat(p));
    if (partes.length !== 3 || partes.some(isNaN)) return 0;
    const volumenCm3 = partes[0] * partes[1] * partes[2];
    return volumenCm3 / 1e6; // convertir cm3 a m3
  }

  // Leer CSV
  await new Promise((resolve, reject) => {
    fs.createReadStream(filePath, { encoding: "utf8" })
      .pipe(csv({ separator: "," }))
      .on("data", (row) => results.push(row))
      .on("end", () => {
        log(`Archivo CSV leído. Registros: ${results.length}`);
        resolve();
      })
      .on("error", (err) => {
        log(`Error leyendo CSV: ${err.message}`);
        reject(err);
      });
  });

  const normalizeString = (str) => {
    if (!str) return "";
    return str.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
  };

  // Sets y Maps para preparar batch
  const categoriasSet = new Set();
  const proveedoresSet = new Set();
  const productosSet = new Map();
  const almacenProductoMap = new Map();
  // Ya no existe proveedorProductoSet
  const movimientosToInsert = [];

  // NUEVO: Mapa para acumular volumen total por almacen (m3)
  const volumenPorAlmacen = new Map();

  // Validaciones y preparación de datos
  for (const [idx, row] of results.entries()) {
    const filaNum = idx + 1;

    // Campos clave
    const id_producto = row.id_producto;
    const id_almacen = row.id_almacen;
    const categoria = row.categoria;
    const id_proveedor = row.id_proveedor;

    // Validar campos mínimos presentes
    if (!id_producto || !id_almacen || !categoria || !id_proveedor) {
      appendLog(`Fila ${filaNum}: campos clave faltantes (id_producto, id_almacen, categoria, id_proveedor)`);
      continue; // saltar esta fila
    }

    categoriasSet.add(categoria);
    proveedoresSet.add(id_proveedor);

    productosSet.set(id_producto, row);
    almacenProductoMap.set(`${id_almacen}|${id_producto}`, row);

    // Validar cantidad_stock para movimiento inventario
    const cantidadStockNum = Number(row.cantidad_stock);
    if (isNaN(cantidadStockNum) || cantidadStockNum < 0) {
      appendLog(`Fila ${filaNum}: cantidad_stock inválido o negativo: '${row.cantidad_stock}'`);
      continue; // saltar
    }

    // NUEVO: Calcular volumen y acumular por almacen
    const volumenUnitario = calcularVolumen(row.dimensiones_cm);
    const volumenTotal = volumenUnitario * cantidadStockNum;
    volumenPorAlmacen.set(
      id_almacen,
      (volumenPorAlmacen.get(id_almacen) || 0) + volumenTotal
    );

    movimientosToInsert.push({
      id: uuidv4(),
      id_producto,
      id_almacen,
      id_proveedor, // ahora incluido
      tipo: true,
      cantidad: cantidadStockNum,
      fecha: new Date()
    });
  }

  // --- Categorias ---
  const categoriasArray = [...categoriasSet];
  const categoriasExistentes = await prisma.categoria.findMany({
    where: { nombre: { in: categoriasArray } }
  });
  const categoriasExistentesNombres = new Set(categoriasExistentes.map(c => normalizeString(c.nombre)));

  const categoriasToCreate = categoriasArray
    .filter(c => !categoriasExistentesNombres.has(normalizeString(c)))
    .map(nombre => ({ id: uuidv4(), nombre, descripcion: "" }));

  if (categoriasToCreate.length > 0) {
    log(`Creando categorías nuevas: ${categoriasToCreate.length}`);
    await prisma.categoria.createMany({ data: categoriasToCreate });
  }

  const categoriasAll = await prisma.categoria.findMany({
    where: { nombre: { in: categoriasArray } }
  });
  const categoriaNombreToId = new Map(categoriasAll.map(c => [normalizeString(c.nombre), c.id]));

  // --- Proveedores ---
  const proveedoresArray = [...proveedoresSet];
  const proveedoresExistentes = await prisma.proveedor.findMany({
    where: { id: { in: proveedoresArray } }
  });
  const proveedoresExistentesIds = new Set(proveedoresExistentes.map(p => p.id));

  const proveedoresToCreate = proveedoresArray
    .filter(id => !proveedoresExistentesIds.has(id))
    .map(id => ({ id }));

  if (proveedoresToCreate.length > 0) {
    log(`Creando proveedores nuevos: ${proveedoresToCreate.length}`);
    await prisma.proveedor.createMany({ data: proveedoresToCreate });
  }

  // --- Productos existentes ---
  const productoIdsArray = [...productosSet.keys()];
  const productosExistentes = await prisma.producto.findMany({
    where: { id_producto: { in: productoIdsArray } }
  });
  const productosExistentesIds = new Set(productosExistentes.map(p => p.id_producto));

  // --- Crear productos nuevos ---
  const productosToCreate = [];
  for (const [id_producto, row] of productosSet.entries()) {
    if (!productosExistentesIds.has(id_producto)) {
      const categoriaId = categoriaNombreToId.get(normalizeString(row.categoria));
      if (!categoriaId) {
        appendLog(`Producto ${id_producto} ignorado: categoría no encontrada '${row.categoria}'`);
        continue;
      }
      const codigoBarrasNum = Number(row.codigo_barras);
      const precioUnitarioNum = Number(row.precio_unitario);
      const pesoKgNum = Number(row.peso_kg);

      if (isNaN(codigoBarrasNum) || isNaN(precioUnitarioNum) || isNaN(pesoKgNum)) {
        appendLog(`Producto ${id_producto} ignorado: valores numéricos inválidos (codigo_barras, precio_unitario, peso_kg)`);
        continue;
      }
      if (!row.dimensiones_cm) {
        appendLog(`Producto ${id_producto} ignorado: dimensiones_cm vacío o inválido`);
        continue;
      }

      productosToCreate.push({
        id_producto,
        nombre_producto: row.nombre_producto,
        categoria_id: categoriaId,
        descripcion: row.descripcion,
        sku: row.sku,
        codigo_barras: String(codigoBarrasNum),
        precio_unitario: precioUnitarioNum,
        peso_kg: pesoKgNum,
        dimensiones_cm: row.dimensiones_cm,
        es_fragil: row.es_fragil === "true" || row.es_fragil === true,
        requiere_refrigeracion: row.requiere_refrigeracion === "true" || row.requiere_refrigeracion === true,
        estado: row.estado === "true" || row.estado === true
      });
    }
  }
  if (productosToCreate.length > 0) {
    log(`Creando productos nuevos: ${productosToCreate.length}`);
    const batchSize = 500;
    for (let i = 0; i < productosToCreate.length; i += batchSize) {
      const batch = productosToCreate.slice(i, i + batchSize);
      log(`Insertando batch productos: ${i} - ${i + batch.length - 1}`);
      log(`Ejemplo datos batch[0]: ${JSON.stringify(batch[0], null, 2)}`);
      try {
        await prisma.producto.createMany({ data: batch });
      } catch (error) {
        log(`ERROR al insertar batch productos: ${error.message}`);
        log(`Datos batch fallido: ${JSON.stringify(batch, null, 2)}`);
        throw error;
      }
    }
  }

  // --- Almacenes existentes ---
  const almacenIds = [...new Set(results.map(r => r.id_almacen))];
  const almacenesExistentes = await prisma.almacen.findMany({
    where: { id_almacen: { in: almacenIds } }
  });
  const almacenesExistentesIds = new Set(almacenesExistentes.map(a => a.id_almacen));

  // NUEVO: actualizar capacidad usada m3 de almacenes según volumen acumulado
  const updates = almacenesExistentes.map(a => {
    const incrementoVolumen = volumenPorAlmacen.get(a.id_almacen) || 0;
    const nuevaCapacidadUsada = a.capacidad_usada_m3 + incrementoVolumen;
    return prisma.almacen.update({
      where: { id_almacen: a.id_almacen },
      data: { capacidad_usada_m3: nuevaCapacidadUsada }
    });
  });
  await Promise.all(updates);

  // --- AlmacenProducto existentes ---
  const almacenProductoKeys = [...almacenProductoMap.keys()];
  const almacenProductosExistentes = [];
  for (const id_almacen of almacenIds) {
    const productosIdsPorAlmacen = almacenProductoKeys
      .filter(key => key.startsWith(id_almacen + "|"))
      .map(key => key.split('|')[1]);

    const encontrados = await prisma.almacenProducto.findMany({
      where: {
        id_almacen,
        id_producto: { in: productosIdsPorAlmacen }
      }
    });
    almacenProductosExistentes.push(...encontrados);
  }
  const almacenProductoExistentesMap = new Map(almacenProductosExistentes.map(ap => [`${ap.id_almacen}|${ap.id_producto}`, ap]));

  // --- Crear o actualizar AlmacenProducto ---
  const almacenProductoToCreate = [];
  const almacenProductoToUpdate = [];

  for (const [key, row] of almacenProductoMap.entries()) {
    const almacenProductoExistente = almacenProductoExistentesMap.get(key);
    const cantidad_stock = Number(row.cantidad_stock);
    const nivel_reorden = Number(row.nivel_reorden);
    const ultima_reposicion = parseDate(row.ultima_reposicion) || new Date();
    const fecha_vencimiento = row.fecha_vencimiento ? parseDate(row.fecha_vencimiento) : null;

    if (!almacenesExistentesIds.has(row.id_almacen)) {
      appendLog(`Almacen no existe: ${row.id_almacen}`);
      continue;
    }

    if (!almacenProductoExistente) {
      almacenProductoToCreate.push({
        id: uuidv4(),
        id_producto: row.id_producto,
        id_almacen: row.id_almacen,
        cantidad_stock,
        nivel_reorden,
        ultima_reposicion,
        fecha_vencimiento
      });
    } else {
      almacenProductoToUpdate.push({
        id: almacenProductoExistente.id,
        cantidad_stock: almacenProductoExistente.cantidad_stock + cantidad_stock,
        nivel_reorden,
        ultima_reposicion,
        fecha_vencimiento
      });
    }
  }

  // Batch update AlmacenProducto
  for (const upd of almacenProductoToUpdate) {
    log(`Actualizando almacenProducto ID: ${upd.id}`);
    await prisma.almacenProducto.update({
      where: { id: upd.id },
      data: {
        cantidad_stock: upd.cantidad_stock,
        nivel_reorden: upd.nivel_reorden,
        ultima_reposicion: upd.ultima_reposicion,
        fecha_vencimiento: upd.fecha_vencimiento
      }
    });
  }

  // Batch create AlmacenProducto
  if (almacenProductoToCreate.length > 0) {
    log(`Creando almacenProductos nuevos: ${almacenProductoToCreate.length}`);
    const batchSize = 500;
    for (let i = 0; i < almacenProductoToCreate.length; i += batchSize) {
      const batch = almacenProductoToCreate.slice(i, i + batchSize);
      log(`Insertando batch almacenProducto: ${i} - ${i + batch.length - 1}`);
      await prisma.almacenProducto.createMany({ data: batch });
    }
  }

  // --- Insertar movimientos inventory batch ---
  if (movimientosToInsert.length > 0) {
    log(`Insertando movimientos de inventario: ${movimientosToInsert.length}`);
    const batchSize = 500;
    for (let i = 0; i < movimientosToInsert.length; i += batchSize) {
      const batch = movimientosToInsert.slice(i, i + batchSize);
      log(`Insertando batch movimientos inventory: ${i} - ${i + batch.length - 1}`);
      await prisma.movement_Inventory.createMany({ data: batch });
    }
  }

  const endTime = Date.now();
  const durationSeconds = ((endTime - startTime) / 1000).toFixed(2);
  log(`Tiempo total de carga masiva productos: ${durationSeconds} segundos`);

  logStream.end();

  return {
    totalProcesados: results.length,
  };

  // Función auxiliar para parsear fechas dd/mm/yyyy
  function parseDate(str) {
    if (!str) return null;
    const parts = str.split('/');
    if (parts.length !== 3) return null;
    const d = new Date(parts[2], parts[1] - 1, parts[0]);
    return isNaN(d.getTime()) ? null : d;
  }
}




  async createProductoSimple(productoData) {
    const {
      id_producto,
      nombre_producto,
      categoria_id, // se usa directamente
      descripcion,
      sku,
      codigo_barras,
      precio_unitario,
      peso_kg,
      dimensiones_cm,
      es_fragil,
      requiere_refrigeracion,
      estado
    } = productoData;

    return await prisma.$transaction(async (tx) => {
      // Validar si ya existe el producto
      const existingProducto = await tx.producto.findUnique({
        where: { id_producto }
      });

      if (existingProducto) {
        throw new Error(`El producto con ID '${id_producto}' ya existe.`);
      }

      // Validar que la categoría exista
      const categoria = await CategoriaService.getById(categoria_id);
      if (!categoria) {
        throw new Error(`Categoría con ID '${categoria_id}' no encontrada.`);
      }

      // Crear el producto
      const producto = await tx.producto.create({
        data: {
          id_producto,
          nombre_producto,
          categoria_id,
          descripcion,
          sku,
          codigo_barras,
          precio_unitario,
          peso_kg,
          dimensiones_cm,
          es_fragil,
          requiere_refrigeracion,
          estado 
        }
      });

      return {
        success: true,
        message: "Producto creado exitosamente.",
        producto
      };
    });
  }

  async calcularVolumen(dimensiones) {
    const parts = dimensiones.split('x').map(Number);
    const [largo, ancho, alto] = parts;
    return (largo * ancho * alto) / 10000;
  }

  async getAll() {
    return prisma.producto.findMany();
  }

  async getById(id_producto) {
    const producto = await prisma.producto.findFirst({
      where: { id_producto }
    });
    if (!producto) throw new Error('producto no encontrado');
    return producto;
  }

  async update(id_producto, data) {
    try {
      if (data.id_producto) {
        throw new Error('No se puede actualizar el id del producto.');
      }

      const prod = await prisma.producto.findFirst({
        where: { id_producto: id_producto }
      });

      if (!prod) {
        throw new Error(`El id ${id_producto} no existe en productos.`);
      }

      const updateData = { ...data };

      if (data.categoria_id) {
        const nombre = { nombre: data.categoria_id };
        const categoria = await CategoriaService.findOrCreateCategoria(nombre);

        updateData.categoria = {
          connect: { id: categoria.id }
        };

        delete updateData.categoria_id;
      }

      return prisma.producto.update({
        where: { id_producto },
        data: updateData,
      });
    } catch (error) {
      if (error.code === 'P2025') throw new Error('Producto no encontrado para actualizar.');
      throw error;
    }
  }

  async delete(id_producto) {
    return prisma.$transaction(async (tx) => {
      const producto = await tx.producto.findUnique({ where: { id_producto } });
      if (!producto) throw new Error('Producto no encontrado para eliminar.');

      const deletedProductoAlmacen = await tx.almacenProducto.deleteMany({ where: { id_producto } });
      const inactivedProducto = await tx.producto.update({
        where: { id_producto },
        data: {
          estado: false
        }
      });

      return { message: "Producto eliminado correctamente", producto: inactivedProducto };
    });

  }

}

module.exports = new ProductoService();