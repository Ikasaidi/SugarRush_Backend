import { Request, Response, NextFunction } from "express";

const mockFindOne = jest.fn();
const mockCreate = jest.fn();
const mockPurchasesFind = jest.fn();
const mockSort = jest.fn();
const mockLean = jest.fn();

jest.mock("../../src/models/WalletModel", () => ({
  WalletModel: {
    findOne: mockFindOne,
    create: mockCreate,
  },
}));

jest.mock("../../src/models/PurchasesModel", () => ({
  PurchasesModel: {
    find: mockPurchasesFind,
  },
}));

import { WalletController } from "../../src/controllers/walletController";

describe("WalletController", () => {
  let controller: WalletController;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    controller = new WalletController();

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();

    mockSort.mockReturnValue({
      lean: mockLean,
    });

    mockPurchasesFind.mockReturnValue({
      sort: mockSort,
    });
  });

  it("doit retourner 400 si userId absent", async () => {
    const req = {} as any;

    await controller.me(req, res as Response, next as NextFunction);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Missing user id",
    });
  });

  it("doit retourner wallet + purchases + stats", async () => {
    const wallet = {
      user_id: "user-1",
      paid_ticket_balance: 5,
    };

    const purchases = [
      { total_amount: 10 },
      { total_amount: 15 },
    ];

    mockFindOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(wallet),
    });

    mockLean.mockResolvedValue(purchases);

    const req = {
      user: { id: "user-1" },
    } as any;

    await controller.me(req, res as Response, next as NextFunction);

    expect(mockFindOne).toHaveBeenCalledWith({
      user_id: "user-1",
    });

    expect(mockPurchasesFind).toHaveBeenCalledWith({
      user_id: "user-1",
    });

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      wallet,
      purchases,
      stats: {
        total_spent: 25,
      },
    });
  });

  it("doit créer un wallet si absent", async () => {
    const createdWallet = {
      user_id: "user-1",
      free_ticket_balance: 0,
      paid_ticket_balance: 0,
      toObject: () => ({
        user_id: "user-1",
      }),
    };

    mockFindOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    });

    mockCreate.mockResolvedValue(createdWallet);

    mockLean.mockResolvedValue([]);

    const req = {
      user: { id: "user-1" },
    } as any;

    await controller.me(req, res as Response, next as NextFunction);

    expect(mockCreate).toHaveBeenCalledWith({
      user_id: "user-1",
    });

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("doit appeler next si erreur", async () => {
    const error = new Error("DB error");

    mockFindOne.mockReturnValue({
      lean: jest.fn().mockRejectedValue(error),
    });

    const req = {
      user: { id: "user-1" },
    } as any;

    await controller.me(req, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith(error);
  });
});