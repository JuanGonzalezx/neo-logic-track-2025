// src/services/ProductoService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const CategoriaService = require('../services/CategoriaService');


class ProductoService {

    async findOrCreateProducto(body) {
        if (
            !body.id_producto || !body.nombre_producto || !body.categoria_id ||
            !body.descripcion || !body.sku || !body.codigo_barras ||
            !body.precio_unitario || !body.peso_kg || !body.dimensiones_cm
        ) {
            throw new Error("Todos los campos son requeridos");
        }

        let categoria = await CategoriaService.getByName(body.categoria_id)
        body.categoria_id = categoria.id

        let id_producto = body.id_producto
        let producto = await prisma.producto.findFirst({
            where: { id_producto },
        });

        if (!producto) {
            producto = await prisma.producto.create({
                data: body
            });
            return producto;
        }
        else {
            throw new Error(`El producto '${body.id_producto}' ya está en uso.`);
        }

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
                throw new Error('No se puede actualizar los id');
            }

            let categoria = await CategoriaService.getByName(data.categoria_id)
            data.categoria_id = categoria.id

            if (!categoria) {
                  throw new Error('La categoria noo existe');
            }

            return prisma.producto.update({
                where: { id_producto },
                data,
            });
        } catch (error) {
            if (error.code === 'P2025') throw new Error('producto no encontrado para actualizar.');
            throw error;
        }
    }

    async delete(id_producto) {
        const producto = await this.getById(id_producto);

        // if (producto.AlmacenProducto.length > 0) {
        //     throw new Error('No se puede eliminar el producto, tiene almacenes asociados.');
        // }
        // if (producto.Movement_Inventory.length > 0) {
        //     throw new Error('No se puede eliminar el producto, tiene movimientos asociados.');
        // }

        try {
            return prisma.producto.delete({ where: { id_producto } });
        } catch (error) {
            if (error.code === 'P2025') throw new Error('producto no encontrado para eliminar.');
            throw error;
        }
    }
}

module.exports = new ProductoService();