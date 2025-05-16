// src/services/ProveedorProductoService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ProductoService = require('../services/ProductoService');
const ProveedorService = require('../services/ProveedorService');


class ProveedorProductoService {

    async findOrCreateProveedorProducto({ id_producto, id_proveedor }) {
        if (!id_producto || !id_proveedor) {
            throw new Error("id_producto e id_proveedor son requeridos.");
        }

        let proveedorProducto = await prisma.proveedorProducto.findFirst({
            where: { id_producto, id_proveedor }
        });

        if (!proveedorProducto) {
            proveedorProducto = await prisma.proveedorProducto.create({
                data: { id_producto, id_proveedor },
            });
            return proveedorProducto;
        }
        return proveedorProducto


    }


    async getAll() {
        return prisma.proveedorProducto.findMany();
    }

    async getById(id_proveedorproductos) {
        let id = id_proveedorproductos
        const proveedorProducto = await prisma.proveedorProducto.findFirst({
            where: { id }
        });
        if (!proveedorProducto) throw new Error('no encontrado');
        return proveedorProducto;
    }

    async getByProducto(id_producto) {
        const producto = await prisma.proveedorProducto.findMany({
            where: { id_producto }
        });
        if (!producto.length > 0) throw new Error('No hay productos del proveedor');
        return producto;
    }

    async getByProveedor(id_proveedor) {
        const proveedor = await prisma.proveedorProducto.findMany({
            where: { id_proveedor }
        });
        if (!proveedor.length > 0) throw new Error('No hay proveedores de este producto');
        return proveedor;
    }

    async update(id, data) {
        // Prevenir cambiar el nombre a uno que ya existe
        if (data.nombre) {
            const existing = await prisma.proveedor.findFirst({
                where: { nombre: data.nombre, NOT: { id } },
            });
            if (existing) throw new Error(`El nombre de proveedor '${data.nombre}' ya está en uso.`);
        }
        try {
            return prisma.proveedor.update({
                where: { id },
                data,
            });
        } catch (error) {
            if (error.code === 'P2025') throw new Error('proveedor no encontrado para actualizar.');
            throw error;
        }
    }

    async delete(id) {
        try {
            return prisma.proveedorProducto.delete({ where: { id } });
        } catch (error) {
            if (error.code === 'P2025') throw new Error('proveedor no encontrado para eliminar.');
            throw error;
        }
    }

    async deleteProductos(id) {
        try {
            return prisma.proveedorProducto.deleteMany({ where: { id_producto: id } });
        } catch (error) {
            if (error.code === 'P2025') throw new Error('proveedor no encontrado para eliminar.');
            throw error;
        }
    }

}

module.exports = new ProveedorProductoService();