// controllers/PermissionController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");


// Crear permiso
const createPermission = async (req, res) => {
  const { name, url, method, description, category } = req.body;
  try {

    const find = await prisma.permission.findFirst({
      where: { name, url, method }
    })

    if (find) {
      res.status(400).json({ message: "Ya existe el permiso" });
    }
    else {
      const permission = await prisma.permission.create({
        data: { name, url, method, description, category },
      });
      res.status(201).json(permission);
    }

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener todos los permisos
const getPermissions = async (req, res) => {
  try {
    const permissions = await prisma.permission.findMany();
    res.status(200).json(permissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener un permiso por ID
const getPermissionById = async (req, res) => {
  const { id } = req.params;
  try {
    const permission = await prisma.permission.findUnique({ where: { id } });
    if (!permission) return res.status(404).json({ error: 'Permission not found' });
    res.json(permission);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar permiso
const updatePermission = async (req, res) => {
  const { id } = req.params;
  const { name, url, method, description, category } = req.body;
  try {
    const updated = await prisma.permission.update({
      where: { id },
      data: { name, url, method, description, category },
    });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Eliminar permiso
const deletePermission = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.permission.delete({ where: { id } });
    res.json({ message: 'Permission deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const checkPermission = (url, methodExpected) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token no proporcionado" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userPermissions = decoded.permissions || [];

      const hasPermission = userPermissions.some(
        (perm) => perm.url === url && perm.method === methodExpected
      );

      if (!hasPermission) {
        return res.status(403).json({ message: "No tienes permiso para acceder a esta ruta" });
      }

      req.user = decoded; // Guardar usuario
      next();
    } catch (error) {
      return res.status(401).json({ message: "Token inválido" });
    }
  };
};

module.exports = {
  getPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
  checkPermission
};