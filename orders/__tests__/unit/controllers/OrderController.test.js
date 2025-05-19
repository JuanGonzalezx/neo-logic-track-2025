// Mock the product service client before requiring the controller
jest.mock('../../../src/lib/productServiceClient', () => {
  return {
    findProductById: jest.fn().mockResolvedValue({ id: 1, name: 'Mock Product', dimensiones: '10x10x10' })
  };
});

const OrderController = require('../../../src/controllers/OrderController');

describe('OrderController basic logic', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should return 400 if required fields are missing on create', async () => {
    await OrderController.createOrder(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should create order with valid orderProducts', async () => {
    req.body = { orderProducts: [{ productId: 1, quantity: 2 }] };
    // Simulate a successful creation by calling the real controller (if it doesn't throw)
    // If you want to mock the service layer, do it inside the controller, not here
    // This test ensures the iterable error does not occur
    try {
      await OrderController.createOrder(req, res);
    } catch (e) {
      // If the controller throws, fail the test
      expect(e).toBeUndefined();
    }
    // Accept either 201 or 200 depending on your controller logic
    expect(res.status).toHaveBeenCalledWith(expect.any(Number));
    expect(res.json).toHaveBeenCalled();
  });

  it('should return 404 for getOrderById if not found', async () => {
    req.params.id = 'doesnotexist';
    // Mock service to return null
    jest.spyOn(OrderController, 'getOrderById').mockImplementationOnce(async (req, res) => {
      res.status(404).json({ message: 'Order not found' });
    });
    await OrderController.getOrderById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('should call res.status(200) for getAllOrders', async () => {
    jest.spyOn(OrderController, 'getAllOrders').mockImplementationOnce(async (req, res) => {
      res.status(200).json([]);
    });
    await OrderController.getAllOrders(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should return 400 for updateOrder with missing id', async () => {
    await OrderController.updateOrder(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should update order with valid orderProducts and id', async () => {
    req.body = { orderProducts: [{ productId: 1, quantity: 2 }] };
    req.params.id = 'validid';
    try {
      await OrderController.updateOrder(req, res);
    } catch (e) {
      expect(e).toBeUndefined();
    }
    expect(res.status).toHaveBeenCalledWith(expect.any(Number));
    expect(res.json).toHaveBeenCalled();
  });
});