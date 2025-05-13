jest.mock("dotenv", () => ({
  config: jest.fn(),
}));

// Creamos mocks para las funciones de Prisma
const mockFindUnique = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();

// Mock de PrismaClient
jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    users: {
      findUnique: mockFindUnique,
      create: mockCreate,
      update: mockUpdate,
    },
  })),
}));

// Mock de bcrypt
jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

// Correct mocking for sendPassVerificationEmail
jest.mock("../../../src/controllers/AuthController", () => {
  const originalModule = jest.requireActual("../../../src/controllers/AuthController");
  return {
    ...originalModule,
    sendPassVerificationEmail: jest.fn().mockResolvedValue(true),
    sendEmail: jest.fn().mockResolvedValue(true),
  };
});

// Fixing JWT mocking
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("test_token"),
}));

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  signUp,
  signIn,
  verifyCode,
  resendVerificationCode,
  secondFactorAuthentication,
  changePassword,
  resendSMS,
  sendEmail,
  verifyPassCode,
  resetPassword,
  ChangeResetPassword,
  sendPassVerificationEmail,
} = require("../../../src/controllers/AuthController");

// Mock que omite algunos de los console.log del AuthController
jest.spyOn(console, "log").mockImplementation(() => {});

// Fixing bcrypt.compare and bcrypt.hash calls
bcrypt.compare.mockImplementation((password, hashedPassword) => {
  return password === "correctpassword" && hashedPassword === "hashedCorrectPassword"
    ? Promise.resolve(true)
    : Promise.resolve(false);
});

bcrypt.hash.mockImplementation((password, saltRounds) => {
  return Promise.resolve("hashed_password");
});

describe("SignUp Controller Method", () => {
  let req;
  let res;

  // Ensure req and res are initialized in all tests
  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {},
      params: {},
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  test("Return message all required fields", async () => {
    req.body = {
      fullname: "User Test",
    };
    await signUp(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "All required fields: fullname, email, password and number",
    });
  });

  test("Should return error for invalid email format", async () => {
    req.body = {
      fullname: "User Test",
      email: "test.com",
      current_password: "test123",
      number: "1234567890",
    };
    await signUp(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid email format" });
  });

  test("Should return error for length password", async () => {
    req.body = {
      fullname: "User Test",
      email: "test@test.com",
      current_password: "test1",
      number: "1234567890",
    };
    await signUp(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Password must be at least 6 characters long",
    });
  });

  test("Should return error if email already exists", async () => {
    req.body = {
      fullname: "User Test",
      email: "test1@test.com",
      current_password: "test123",
      number: "1234567890",
    };

    // Configuramos el comportamiento del mock
    mockFindUnique.mockResolvedValue({
      id: 1,
      email: "test1@test.com",
    });

    await signUp(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Email allready registered",
    });
  });

  test("Should create a user successfully", async () => {
    req.body = {
      fullname: "User Test",
      email: "test@test.com",
      current_password: "test123",
      number: "1234567890",
    };

    // Usuario no existe
    mockFindUnique.mockResolvedValue(null);

    // Configurar mock para el hash
    const hashedPassword = "hashed_password";
    bcrypt.hash.mockResolvedValue(hashedPassword);

    // Configurar mock para la creación de usuario
    const createdUser = {
      id: "mock-user-id",
      fullname: "User Test",
      email: "test@test123.com",
      current_password: "test123",
      number: "1234567890"
    };
    mockCreate.mockResolvedValue(createdUser);
    sendEmail.mockResolvedValue(true);
    await signUp(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "User registered succesfully. Please check your email for verification code.",
      userId: createdUser.id,
      email: "test@test123.com"
    });
  });
});

describe("ChangeResetPassword Controller Method", () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {},
      params: {},
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  test("Should return error when new password is not provided", async () => {
    req.body = {};
    req.params = { id: "1" };

    await ChangeResetPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "A new password is required",
    });
  });

  test("Should return error when new password is less than 6 characters", async () => {
    req.body = { newPassword: "123", confirmNewPassword: "123" };
    req.params = { id: "1" };

    await ChangeResetPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Password must be at least 6 characters long",
    });
  });

  test("Should return error when passwords do not match", async () => {
    req.body = { newPassword: "password1", confirmNewPassword: "password2" };
    req.params = { id: "1" };

    await ChangeResetPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "The new password don't match",
    });
  });

  test("Should change password successfully", async () => {
    req.body = { newPassword: "password1", confirmNewPassword: "password1", email: "test@test.com" };

    mockFindUnique.mockResolvedValue({
      email: "test@test.com",
      passwordStatus: "PENDING",
    });

    bcrypt.hash.mockResolvedValue("hashed_password");

    await ChangeResetPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Password changed successfully",
    });
  });
});

// The rest of the tests remain unchanged