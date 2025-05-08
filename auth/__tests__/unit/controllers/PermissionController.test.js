const { PrismaClient } = require('@prisma/client');
const {
  createPermission,
  getPermissions,
  getPermissionById,
  updatePermission,
  deletePermission,
} = require('../../../src/controllers/PermissionController');

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    permission: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

describe('PermissionController', () => {
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

  describe('createPermission', () => {
    test('should create a new permission', async () => {
      req.body = { name: 'Test', url: '/test', method: 'GET', description: 'Test description' };
      const mockPermission = { id: 1, ...req.body };
      prisma.permission.create.mockResolvedValue(mockPermission);

      await createPermission(req, res);

      expect(prisma.permission.create).toHaveBeenCalledWith({ data: req.body });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockPermission);
    });

    test('should handle errors', async () => {
      prisma.permission.create.mockRejectedValue(new Error('Database error'));

      await createPermission(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('getPermissions', () => {
    test('should return all permissions', async () => {
      const mockPermissions = [{ id: 1, name: 'Test' }];
      prisma.permission.findMany.mockResolvedValue(mockPermissions);

      await getPermissions(req, res);

      expect(prisma.permission.findMany).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockPermissions);
    });

    test('should handle errors', async () => {
      prisma.permission.findMany.mockRejectedValue(new Error('Database error'));

      await getPermissions(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('getPermissionById', () => {
    test('should return a permission by ID', async () => {
      req.params.id = '1';
      const mockPermission = { id: 1, name: 'Test' };
      prisma.permission.findUnique.mockResolvedValue(mockPermission);

      await getPermissionById(req, res);

      expect(prisma.permission.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(res.json).toHaveBeenCalledWith(mockPermission);
    });

    test('should return 404 if permission not found', async () => {
      req.params.id = '1';
      prisma.permission.findUnique.mockResolvedValue(null);

      await getPermissionById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Permission not found' });
    });

    test('should handle errors', async () => {
      prisma.permission.findUnique.mockRejectedValue(new Error('Database error'));

      await getPermissionById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('updatePermission', () => {
    test('should update a permission', async () => {
      req.params.id = '1';
      req.body = { name: 'Updated Test' };
      const mockUpdatedPermission = { id: 1, ...req.body };
      prisma.permission.update.mockResolvedValue(mockUpdatedPermission);

      await updatePermission(req, res);

      expect(prisma.permission.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: req.body,
      });
      expect(res.json).toHaveBeenCalledWith(mockUpdatedPermission);
    });

    test('should handle errors', async () => {
      prisma.permission.update.mockRejectedValue(new Error('Database error'));

      await updatePermission(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('deletePermission', () => {
    test('should delete a permission', async () => {
      req.params.id = '1';
      prisma.permission.delete.mockResolvedValue({});

      await deletePermission(req, res);

      expect(prisma.permission.delete).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(res.json).toHaveBeenCalledWith({ message: 'Permission deleted' });
    });

    test('should handle errors', async () => {
      prisma.permission.delete.mockRejectedValue(new Error('Database error'));

      await deletePermission(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });
});