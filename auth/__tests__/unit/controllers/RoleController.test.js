const { PrismaClient } = require('@prisma/client');
const {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
  addPermissionsToRole,
  removePermissionsFromRole,
} = require('../../../src/controllers/RoleController');

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    role: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    permission: {
      findMany: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

describe('RoleController', () => {
  let req;
  let res;
  let prisma;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    prisma = new PrismaClient();
  });

  describe('createRole', () => {
    test('should create a new role', async () => {
      req.body = { name: 'Admin', description: 'Admin role', permissionIds: [1, 2] };
      const mockRole = { id: 1, ...req.body };
      prisma.role.create.mockResolvedValue(mockRole);

      await createRole(req, res);

      expect(prisma.role.create).toHaveBeenCalledWith({ data: req.body });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockRole);
    });

    test('should handle errors', async () => {
      prisma.role.create.mockRejectedValue(new Error('Database error'));

      await createRole(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('getRoles', () => {
    test('should return all roles with permissions', async () => {
      const mockRoles = [
        { id: 1, name: 'Admin', permissionIds: [1, 2] },
        { id: 2, name: 'User', permissionIds: [3] },
      ];
      const mockPermissions = [
        { id: 1, name: 'Permission 1' },
        { id: 2, name: 'Permission 2' },
        { id: 3, name: 'Permission 3' },
      ];

      prisma.role.findMany.mockResolvedValue(mockRoles);
      prisma.permission.findMany.mockResolvedValue(mockPermissions);

      await getRoles(req, res);

      expect(prisma.role.findMany).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        mockRoles.map((role) => ({
          ...role,
          permissions: mockPermissions.filter((p) => role.permissionIds.includes(p.id)),
        }))
      );
    });

    test('should handle errors', async () => {
      prisma.role.findMany.mockRejectedValue(new Error('Database error'));

      await getRoles(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('getRoleById', () => {
    test('should return a role by ID with permissions', async () => {
      req.params.id = '1';
      const mockRole = { id: 1, name: 'Admin', permissionIds: [1, 2] };
      const mockPermissions = [
        { id: 1, name: 'Permission 1' },
        { id: 2, name: 'Permission 2' },
      ];

      prisma.role.findUnique.mockResolvedValue(mockRole);
      prisma.permission.findMany.mockResolvedValue(mockPermissions);

      await getRoleById(req, res);

      expect(prisma.role.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(res.json).toHaveBeenCalledWith({ ...mockRole, permissions: mockPermissions });
    });

    test('should return 404 if role not found', async () => {
      req.params.id = '1';
      prisma.role.findUnique.mockResolvedValue(null);

      await getRoleById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Role not found' });
    });

    test('should handle errors', async () => {
      prisma.role.findUnique.mockRejectedValue(new Error('Database error'));

      await getRoleById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('updateRole', () => {
    test('should update a role', async () => {
      req.params.id = '1';
      req.body = { name: 'Updated Admin', description: 'Updated description', permissionIds: [1] };
      const mockUpdatedRole = { id: 1, ...req.body };
      prisma.role.update.mockResolvedValue(mockUpdatedRole);

      await updateRole(req, res);

      expect(prisma.role.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: req.body,
      });
      expect(res.json).toHaveBeenCalledWith(mockUpdatedRole);
    });

    test('should handle errors', async () => {
      prisma.role.update.mockRejectedValue(new Error('Database error'));

      await updateRole(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('deleteRole', () => {
    test('should delete a role', async () => {
      req.params.id = '1';
      prisma.role.delete.mockResolvedValue({});

      await deleteRole(req, res);

      expect(prisma.role.delete).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(res.json).toHaveBeenCalledWith({ message: 'Role deleted' });
    });

    test('should handle errors', async () => {
      prisma.role.delete.mockRejectedValue(new Error('Database error'));

      await deleteRole(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('addPermissionsToRole', () => {
    test('should add permissions to a role', async () => {
      req.params.id = '1';
      req.body = { permissionIds: [3] };
      const mockRole = { id: 1, name: 'Admin', permissionIds: [1, 2] };
      const mockUpdatedRole = { id: 1, name: 'Admin', permissionIds: [1, 2, 3] };

      prisma.role.findUnique.mockResolvedValue(mockRole);
      prisma.role.update.mockResolvedValue(mockUpdatedRole);

      await addPermissionsToRole(req, res);

      expect(prisma.role.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(prisma.role.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { permissionIds: [1, 2, 3] },
      });
      expect(res.json).toHaveBeenCalledWith(mockUpdatedRole);
    });

    test('should handle errors', async () => {
      prisma.role.findUnique.mockRejectedValue(new Error('Database error'));

      await addPermissionsToRole(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('removePermissionsFromRole', () => {
    test('should remove permissions from a role', async () => {
      req.params.id = '1';
      req.body = { permissionIds: [2] };
      const mockRole = { id: 1, name: 'Admin', permissionIds: [1, 2, 3] };
      const mockUpdatedRole = { id: 1, name: 'Admin', permissionIds: [1, 3] };

      prisma.role.findUnique.mockResolvedValue(mockRole);
      prisma.role.update.mockResolvedValue(mockUpdatedRole);

      await removePermissionsFromRole(req, res);

      expect(prisma.role.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(prisma.role.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { permissionIds: [1, 3] },
      });
      expect(res.json).toHaveBeenCalledWith(mockUpdatedRole);
    });

    test('should handle errors', async () => {
      prisma.role.findUnique.mockRejectedValue(new Error('Database error'));

      await removePermissionsFromRole(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });
});