const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { validationResult } = require('express-validator');



const getAllCategories = async (req, res) => {
    try {
        // Opción 1: Usando el modelo con @@map
        const categories = await prisma.category.findMany({
            include: {
                productos: true // Incluye relaciones si es necesario
            }
        });

        // Opción 2: Usando SQL directo si persisten problemas
        // const categories = await prisma.$queryRaw`SELECT * FROM categories`;

        res.status(200).json(categories);
    } catch (error) {
        console.error("Error detallado:", {
            message: error.message,
            code: error.code,
            meta: error.meta
        });

        res.status(500).json({
            message: "Error del servidor",
            error: error.message,
            code: error.code // P2021 es error de tabla no encontrada
        });
    }
};


const createCategory = async (req, res) => {
console.log(req.body);
  const { id, name, description } = req.body;

  try {
   
    // Crear la nueva categoría
    const newCategory = await prisma.category.create({
      data: {
        id: id,
        name: name,
        description: description || null // Maneja description opcional
      },
      select: {
        id: true,
        name: true,
        description: true,
      }
    });

    res.status(201).json({
      message: 'Categoría creada exitosamente',
      category: newCategory
    });

  } catch (error) {
    console.error('Error al crear categoría:', error);
    
    res.status(500).json({
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = { getAllCategories, createCategory };