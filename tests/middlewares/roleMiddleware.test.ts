import { Request, Response, NextFunction } from "express";
import { roleMiddleware } from "../../src/middlewares/roleMiddleware";
import { UserModel } from "../../src/models/UsersModel";

jest.mock("../../src/models/UsersModel", () => ({
  UserModel: {
    findById: jest.fn(),
  },
}));

describe("roleMiddleware", () => {
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    res = {};
    next = jest.fn();
  });

  it("doit refuser si user absent", async () => {
    const req = {} as any;

    await roleMiddleware("admin")(
      req as Request,
      res as Response,
      next as NextFunction
    );

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it("doit refuser si user introuvable", async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue(null);

    const req = {
      user: { id: "user-1" },
    } as any;

    await roleMiddleware("admin")(
      req as Request,
      res as Response,
      next as NextFunction
    );

    expect(UserModel.findById).toHaveBeenCalledWith("user-1");
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it("doit refuser si le rôle ne correspond pas", async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue({
      user_type: "student",
    });

    const req = {
      user: { id: "user-1" },
    } as any;

    await roleMiddleware("admin")(
      req as Request,
      res as Response,
      next as NextFunction
    );

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it("doit accepter si le rôle correspond", async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue({
      user_type: "admin",
    });

    const req = {
      user: { id: "user-1" },
    } as any;

    await roleMiddleware("admin")(
      req as Request,
      res as Response,
      next as NextFunction
    );

    expect(next).toHaveBeenCalledWith();
  });
});