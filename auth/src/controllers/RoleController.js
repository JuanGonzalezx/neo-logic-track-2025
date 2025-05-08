// controllers/RoleController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");


// Crear un nuevo rol
const createRole = async (req, res) => {
  let { name, description, permissionIds } = req.body;

  try {
    name = name.toUpperCase();

    // Verificar si ya existe un rol con ese nombre (en mayúsculas siempre)
    const exists = await prisma.role.findUnique({
      where: {
        name: name
      }
    });

    if (exists) {
      return res.status(400).json({ error: "Ya existe un rol con este nombre" });
    }

    const role = await prisma.role.create({
      data: {
        name,
        description,
        permissionIds: permissionIds || [],
      },
    });
    res.status(201).json(role);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener todos los roles con sus permisos
const getRoles = async (req, res) => {
  try {
    const roles = await prisma.role.findMany();
    const rolesWithPermissions = await Promise.all(
      roles.map(async (role) => {
        // const rolesUsers = await prisma.role.findMany({
        //   select: {
        //     id: true,
        //     name: true,
        //     _count: {
        //       select: { Users: true }
        //     }
        //   }
        // });
        // const result = rolesUsers.map(role => ({
        //   usersCount: role._count.Users
        // }));
        const permissions = await prisma.permission.findMany({
          where: { id: { in: role.permissionIds } },
        });
        return { ...role, permissions };
      })
    );

    res.status(200).json(rolesWithPermissions);
    // res.status(200).json(rolesWithPermissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener un rol por ID con sus permisos
const getRoleById = async (req, res) => {
  const { id } = req.params;
  try {
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) return res.status(404).json({ error: 'Role not found' });

    const permissions = await prisma.permission.findMany({
      where: { id: { in: role.permissionIds } },
    });

    res.json({ ...role, permissions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar un rol (incluyendo sus permisos)
const updateRole = async (req, res) => {
  const { id } = req.params;
  const { name, description, permissionIds } = req.body;
  try {
    const updatedRole = await prisma.role.update({
      where: { id },
      data: {
        name,
        description,
        permissionIds,
      },
    });
    res.json(updatedRole);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Eliminar un rol
const deleteRole = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.role.delete({ where: { id } });
    res.json({ message: 'Role deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Agregar permisos a un rol existente
const addPermissionsToRole = async (req, res) => {
  const { id } = req.params;
  const { permissionIds } = req.body;
  try {
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) return res.status(404).json({ error: 'Role not found' });

    const updated = await prisma.role.update({
      where: { id },
      data: {
        permissionIds: Array.from(new Set([...role.permissionIds, ...permissionIds])),
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Remover permisos de un rol

const removePermissionsFromRole = async (req, res) => {
  const { id } = req.params;
  const { permissionIds } = req.body;
  try {
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) return res.status(404).json({ error: 'Role not found' });

    const updated = await prisma.role.update({
      where: { id },
      data: {
        permissionIds: role.permissionIds.filter((permId) => !permissionIds.includes(permId)),
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

const checkPermission = (url, methodExpected) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token no proporcionado" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decoded);


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
  getRoles,
  getRoleById,
  updateRole,
  createRole,
  deleteRole,
  addPermissionsToRole,
  removePermissionsFromRole,
  checkPermission
}
