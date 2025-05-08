const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../../../src/controllers/UserController");

jest.mock("@prisma/client", () => {
  const mockPrisma = {
    users: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
}));

describe("UserController", () => {
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

  describe("getAllUsers", () => {
    test("should return all users", async () => {
      const mockUsers = [{ id: 1, fullname: "Test User"}];
      prisma.users.findMany.mockResolvedValue(mockUsers);

      await getAllUsers(req, res);

      expect(prisma.users.findMany).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    test("should handle server error", async () => {
      prisma.users.findMany.mockRejectedValue(new Error("Database error"));

      await getAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error del server",
        error: "Database error",
      });
    });
  });

  describe("getUserById", () => {
    test("should return user by ID", async () => {
      req.params.id = "1";
      const mockUser = { id: 1, name: "Test User" };
      prisma.users.findUnique.mockResolvedValue(mockUser);

      await getUserById(req, res);

      expect(prisma.users.findUnique).toHaveBeenCalledWith({ where: { id: "1" } });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    test("should return 404 if user not found", async () => {
      req.params.id = "1";
      prisma.users.findUnique.mockResolvedValue(null);

      await getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });
  });

  describe("createUser", () => {
    test("should create a new user", async () => {
      req.body = {
        fullname: "Test User",
        email: "test@test.com",
        current_password: "password123",
        number: "1234567890",
        rolId: "6813d88bd0cb1281aaa26120"
      };

      prisma.users.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
      bcrypt.hash.mockResolvedValue("hashed_password");
      prisma.users.create.mockResolvedValue({ id: 1, email: "test@test.com" });

      await createUser(req, res);

      expect(prisma.users.findUnique).toHaveBeenCalledTimes(2);
      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
      expect(prisma.users.create).toHaveBeenCalledWith({
        data: {
          fullname: "Test User",
          email: "test@test.com",
          current_password: "hashed_password",
          number: "1234567890",
          status: "PENDING",
        },
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "User created successfully",
        userId: 1,
        email: "test@test.com",
      });
    });
  });

  describe("updateUser", () => {
    test("should update user details", async () => {
      req.params.id = "1";
      req.body = { email: "newemail@test.com" };

      prisma.users.findUnique.mockResolvedValue(null);
      prisma.users.update.mockResolvedValue({ id: 1, email: "newemail@test.com" });

      await updateUser(req, res);

      expect(prisma.users.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: { email: "newemail@test.com" },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: 1, email: "newemail@test.com" });
    });
  });

  describe("deleteUser", () => {
    test("should delete user by ID", async () => {
      req.params.id = "1";

      prisma.users.delete.mockResolvedValue({});

      await deleteUser(req, res);

      expect(prisma.users.delete).toHaveBeenCalledWith({ where: { id: "1" } });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Usuario eliminado correctamente" });
    });
  });
});