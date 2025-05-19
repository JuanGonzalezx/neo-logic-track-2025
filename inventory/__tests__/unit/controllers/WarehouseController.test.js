const AlmacenController = require('../../../src/controllers/AlmacenController');

// Mock the AlmacenService methods used by the controller
jest.mock('../../../src/services/AlmacenService', () => ({
  bulkCreateFromCSV: jest.fn(),
  create: jest.fn(),
  getAll: jest.fn(),
  getById: jest.fn(),
  update: jest.fn(),
  updateCapacidadm3: jest.fn(),
  delete: jest.fn(),
}));
const AlmacenService = require('../../../src/services/AlmacenService');

describe('AlmacenController basic logic', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, params: {}, query: {}, file: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should return 400 if no file is provided for bulkCreate', async () => {
    req.file = undefined;
    await AlmacenController.bulkCreate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
  });

  it('should call service and return 201 for create', async () => {
    AlmacenService.create.mockResolvedValue({ id: 1, name: 'Test' });
    req.body = { name: 'Test' };
    await AlmacenController.create(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 1, name: 'Test' });
  });

  it('should return 200 and array for getAll', async () => {
    AlmacenService.getAll.mockResolvedValue([{ id: 1 }]);
    await AlmacenController.getAll(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
  });

  it('should return 200 and object for getById', async () => {
    AlmacenService.getById.mockResolvedValue({ id: 1 });
    req.params.id_almacen = 1;
    await AlmacenController.getById(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ id: 1 });
  });

  it('should return 200 and updated object for update', async () => {
    AlmacenService.update.mockResolvedValue({ id: 1, name: 'Updated' });
    req.params.id_almacen = 1;
    req.body = { name: 'Updated' };
    await AlmacenController.update(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ id: 1, name: 'Updated' });
  });

  it('should return 200 and updated object for updateCapacidadm3', async () => {
    AlmacenService.updateCapacidadm3.mockResolvedValue({ id: 1, capacidad: 100 });
    req.params.id_almacen = 1;
    req.params.capacity = 100;
    await AlmacenController.updateCapacidadm3(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ id: 1, capacidad: 100 });
  });

  it('should return 204 for delete', async () => {
    AlmacenService.delete.mockResolvedValue();
    req.params.id_almacen = 1;
    await AlmacenController.delete(req, res, next);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });
});
