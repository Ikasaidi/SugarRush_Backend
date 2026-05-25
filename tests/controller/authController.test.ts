import { Request, Response, NextFunction } from "express";
import { AuthController, setAuthServiceForTesting } from "../../src/controllers/authController";
import { AuthService } from "../../src/services/authService";
import { HttpException } from "../../src/utils/http-exception";

// Mock du service
jest.mock("../../src/services/authService");

describe("AuthController", () => {
  let controller: AuthController;
  let res: any;
  let next: jest.Mock;

  // Mocks des méthodes du service
  const mockRegister = jest.fn();
  const mockLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Création d'un mock du service
    const mockedService = {
      register: mockRegister,
      login: mockLogin,
    } as unknown as AuthService;

    // Injection du mock via la fonction prévue à cet effet
    setAuthServiceForTesting(mockedService);

    controller = new AuthController();

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
  });

  afterEach(() => {
    // Optionnel : reset après chaque test
    setAuthServiceForTesting(null as any);
  });

  // ===================== REGISTER =====================
  describe("register", () => {
    it("doit retourner 201 quand la création réussit", async () => {
      const result = {
        token: "fake-token",
        user: {
          id: "user-1",
          email: "test@test.com",
          username: "test",
          user_type: "student",
          fname: "a",
          lname: "b",
          phone: "123",
          address: "addr",
        },
      };

      mockRegister.mockResolvedValue(result);

      const req = {
        body: {
          email: "test@test.com",
          username: "test",
          password: "123",
          user_type: "student",
          fname: "a",
          lname: "b",
          phone: "123",
          address: "addr",
        },
      } as Request;

      await controller.register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        token: "fake-token",
        user: expect.objectContaining({ email: "test@test.com" }),
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("doit appeler next si une erreur se produit", async () => {
      const error = new HttpException(409, "Cet email existe déjà");
      mockRegister.mockRejectedValue(error);

      const req = { body: {} } as Request;

      await controller.register(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  // ===================== LOGIN =====================
  describe("login", () => {
    it("doit retourner 200 quand le login réussit", async () => {
      const result = {
        token: "fake-token",
        user: {
          id: "user-1",
          email: "test@test.com",
          username: "test",
          user_type: "student",
        },
      };

      mockLogin.mockResolvedValue(result);

      const req = {
        body: { email: "test@test.com", password: "123" },
      } as Request;

      await controller.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        token: "fake-token",
        user: expect.objectContaining({ email: "test@test.com" }),
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("doit appeler next si les identifiants sont invalides", async () => {
      const error = new HttpException(401, "Identifiants invalides");
      mockLogin.mockRejectedValue(error);

      const req = {
        body: { email: "test@test.com", password: "wrong" },
      } as Request;

      await controller.login(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});