import { Request, Response, NextFunction } from "express";
import { PurchaseController, setPurchaseServiceForTesting } from "../../src/controllers/purchaseController";
import { PurchaseService } from "../../src/services/purchaseService";
import { HttpException } from "../../src/utils/http-exception";

jest.mock("../../src/services/purchaseService");

describe("PurchaseController", () => {
  let controller: PurchaseController;
  let res: any;
  let next: jest.Mock;
  let mockPurchaseTickets: jest.Mock;
  let mockGetPurchaseHistory: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPurchaseTickets = jest.fn();
    mockGetPurchaseHistory = jest.fn();

    const mockedService = {
      purchaseTickets: mockPurchaseTickets,
      getPurchaseHistory: mockGetPurchaseHistory,
    } as unknown as PurchaseService;

    setPurchaseServiceForTesting(mockedService);

    controller = new PurchaseController();

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
  });

  afterEach(() => {
    setPurchaseServiceForTesting(null as any);
  });

  describe("purchaseTickets", () => {
    it("doit retourner 201 après un achat réussi", async () => {
      const result = {
        message: "Tickets purchased successfully",
        purchase: { _id: "p123" },
        wallet: { paid_ticket_balance: 10 },
      };

      mockPurchaseTickets.mockResolvedValue(result);

      const req = {
        body: {
          quantity: 5,
          unit_price: 20,
          currency: "CAD",
        },
        user: { id: "user123" },   // Important : simulé par le middleware auth
      } as any;

      await controller.purchaseTickets(req, res, next);

      expect(mockPurchaseTickets).toHaveBeenCalledWith({
        user_id: "user123",
        quantity: 5,
        unit_price: 20,
        currency: "CAD",
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(result);
      expect(next).not.toHaveBeenCalled();
    });

    it("doit appeler next en cas d'erreur", async () => {
      const error = new HttpException(400, "Quantity must be greater than 0");
      mockPurchaseTickets.mockRejectedValue(error);

      const req = { body: {}, user: { id: "user123" } } as any;

      await controller.purchaseTickets(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe("getPurchaseHistory", () => {
    it("doit retourner l'historique des achats", async () => {
      const mockPurchases = [{ _id: "p1" }, { _id: "p2" }];
      mockGetPurchaseHistory.mockResolvedValue(mockPurchases);

      const req = {
        user: { id: "user123" },
      } as any;

      await controller.getPurchaseHistory(req, res, next);

      expect(mockGetPurchaseHistory).toHaveBeenCalledWith("user123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockPurchases);
    });
  });
});