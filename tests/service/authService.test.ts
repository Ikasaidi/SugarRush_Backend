import mongoose from "mongoose";
import { AuthService } from "../../src/services/authService";
import { UserModel } from "../../src/models/UsersModel";
import { WalletModel } from "../../src/models/WalletModel";
import { comparePassword } from "../../src/utils/bcryptHelp";
import { generateToken } from "../../src/utils/jwtHelp";
import { HttpException } from "../../src/utils/http-exception";

jest.mock("mongoose", () => ({
  startSession: jest.fn(),
}));

jest.mock("../../src/models/UsersModel", () => {
  const mockUserModel: any = jest.fn();
  mockUserModel.findOne = jest.fn();
  return {
    UserModel: mockUserModel,
  };
});

jest.mock("../../src/models/WalletModel", () => ({
  WalletModel: jest.fn(),
}));

jest.mock("../../src/utils/bcryptHelp", () => ({
  comparePassword: jest.fn(),
}));

jest.mock("../../src/utils/jwtHelp", () => ({
  generateToken: jest.fn(),
}));

const mockUserModel = UserModel as unknown as jest.Mock;
const mockFindOne = UserModel.findOne as unknown as jest.Mock;
const mockWalletModel = WalletModel as unknown as jest.Mock;
const mockComparePassword = comparePassword as unknown as jest.Mock;
const mockGenerateToken = generateToken as unknown as jest.Mock;
const mockStartSession = mongoose.startSession as unknown as jest.Mock;

describe("AuthService", () => {
  let service: AuthService;
  let session: any;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService();

    session = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };

    mockStartSession.mockResolvedValue(session);
  });

  // ======================================================
  // REGISTER
  // ======================================================
  describe("register", () => {
    it("doit créer user + wallet + token", async () => {
      // Préparation : simuler qu'aucun utilisateur avec cet email n'existe
      mockFindOne.mockReturnValue({
        session: jest.fn().mockResolvedValue(null),
      });

      // Mock de l'instance utilisateur créée
      const userInstance = {
        _id: "user-1",
        email: "test@test.com",
        username: "test",
        user_type: "student",
        fname: "a",
        lname: "b",
        phone: "123",
        address: "addr",
        save: jest.fn().mockResolvedValue(true),
      };

      // Mock du constructeur UserModel
      mockUserModel.mockImplementation(() => userInstance);

      // Mock de l'instance wallet
      const walletInstance = {
        save: jest.fn().mockResolvedValue(true),
      };

      mockWalletModel.mockImplementation(() => walletInstance);

      mockGenerateToken.mockReturnValue("fake-token");

      // Action : appeler register
      const result = await service.register({
        email: "test@test.com",
        username: "test",
        password: "123",
        user_type: "student",
        fname: "a",
        lname: "b",
        phone: "123",
        address: "addr",
      });

      // Vérification
      expect(mockFindOne).toHaveBeenCalled();
      expect(result.token).toBe("fake-token");
      expect(result.user.user_type).toBe("student");
    });

    it("doit throw si email existe", async () => {
      // Préparation : simuler qu'un utilisateur existe déjà
      mockFindOne.mockReturnValue({
        session: jest.fn().mockResolvedValue({
          email: "test@test.com",
        }),
      });

      // Action & Vérification
      await expect(
        service.register({
          email: "test@test.com",
          username: "test",
          password: "123",
          user_type: "student",
          fname: "a",
          lname: "b",
          phone: "123",
          address: "addr",
        })
      ).rejects.toThrow(HttpException);
    });
  });

  // ======================================================
  // LOGIN
  // ======================================================
  describe("login", () => {
    it("doit login user valide", async () => {
      // Préparation : simuler la recherche et la comparaison
      mockFindOne.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: "user-1",
          email: "test@test.com",
          password: "hashed",
          username: "test",
          user_type: "student",
          fname: "a",
          lname: "b",
          phone: "123",
          address: "addr",
        }),
      });

      mockComparePassword.mockResolvedValue(true);
      mockGenerateToken.mockReturnValue("token");

      // Action
      const result = await service.login("test@test.com", "123");

      // Vérification
      expect(result.token).toBe("token");
      expect(result.user.email).toBe("test@test.com");
    });

    it("doit refuser mauvais password", async () => {
      // Préparation
      mockFindOne.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          password: "hashed",
        }),
      });

      mockComparePassword.mockResolvedValue(false);

      // Action & Vérification
      await expect(service.login("test@test.com", "123")).rejects.toThrow(
        HttpException
      );
    });

    it("doit throw si utilisateur n'existe pas", async () => {
      // Préparation : aucun utilisateur trouvé
      mockFindOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      // Action & Vérification
      await expect(service.login("test@test.com", "123")).rejects.toThrow(
        HttpException
      );
    });
  });
});
