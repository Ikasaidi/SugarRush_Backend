import { Types } from "mongoose";
import { PurchaseService } from "../../src/services/purchaseService";
import { PurchasesModel } from "../../src/models/PurchasesModel";
import { WalletModel } from "../../src/models/WalletModel";
import { HttpException } from "../../src/utils/http-exception";

// Mock des modèles Mongoose
jest.mock("../../src/models/PurchasesModel");
jest.mock("../../src/models/WalletModel");

describe("PurchaseService", () => {
  let purchaseService: PurchaseService;

  // Un vrai ObjectId valide pour les tests
  const validUserId = "507f1f77bcf86cd799439011"; // 24 caractères hex

  beforeEach(() => {
    jest.clearAllMocks();
    purchaseService = new PurchaseService();
  });

  describe("purchaseTickets", () => {
    it("doit lever une erreur si quantity <= 0", async () => {
      await expect(
        purchaseService.purchaseTickets({
          user_id: validUserId,
          quantity: 0,
          unit_price: 10,
          currency: "CAD",
        })
      ).rejects.toThrow(HttpException);
    });

    it("doit lever une erreur si unit_price < 0", async () => {
      await expect(
        purchaseService.purchaseTickets({
          user_id: validUserId,
          quantity: 5,
          unit_price: -10,
          currency: "CAD",
        })
      ).rejects.toThrow(HttpException);
    });

    it("doit créer un achat et mettre à jour le wallet existant", async () => {
      const mockPurchase = { 
        _id: "purchase123", 
        quantity: 3 
      };
      const mockWallet = { 
        _id: "wallet123", 
        paid_ticket_balance: 5,
        save: jest.fn().mockResolvedValue({})
      };

      (PurchasesModel.create as jest.Mock).mockResolvedValue(mockPurchase);
      (WalletModel.findOne as jest.Mock).mockResolvedValue(mockWallet);

      const result = await purchaseService.purchaseTickets({
        user_id: validUserId,
        quantity: 3,
        unit_price: 15,
        currency: "CAD",
      });

      expect(PurchasesModel.create).toHaveBeenCalledWith({
        user_id: expect.any(Types.ObjectId),
        quantity: 3,
        unit_price: 15,
        total_amount: 45,
        currency: "CAD",
        status: "completed",
      });

      expect(WalletModel.findOne).toHaveBeenCalledWith({
        user_id: expect.any(Types.ObjectId)
      });
      expect(mockWallet.save).toHaveBeenCalled();
      expect(result).toEqual({
        message: "Tickets purchased successfully",
        purchase: mockPurchase,
        wallet: mockWallet,
      });
    });

    it("doit créer un wallet si celui-ci n'existe pas", async () => {
      const mockPurchase = { _id: "purchase456" };
      const mockNewWallet = { 
        _id: "wallet-new",
        paid_ticket_balance: 2 
      };

      (PurchasesModel.create as jest.Mock).mockResolvedValue(mockPurchase);
      (WalletModel.findOne as jest.Mock).mockResolvedValue(null);
      (WalletModel.create as jest.Mock).mockResolvedValue(mockNewWallet);

      const result = await purchaseService.purchaseTickets({
        user_id: validUserId,
        quantity: 2,
        unit_price: 10,
        currency: "CAD",
      });

      expect(WalletModel.create).toHaveBeenCalledWith({
        user_id: expect.any(Types.ObjectId),
        free_ticket_balance: 0,
        paid_ticket_balance: 2,
      });

      expect(result.message).toBe("Tickets purchased successfully");
    });
  });

  describe("getPurchaseHistory", () => {
    it("doit retourner l'historique des achats trié par date descendante", async () => {
      const mockPurchases = [
        { _id: "p1", created_at: new Date() },
        { _id: "p2", created_at: new Date(Date.now() - 100000) },
      ];

      (PurchasesModel.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockPurchases),
      });

      const result = await purchaseService.getPurchaseHistory(validUserId);

      expect(PurchasesModel.find).toHaveBeenCalledWith({
        user_id: expect.any(Types.ObjectId),
      });
      expect(result).toEqual(mockPurchases);
    });
  });
});