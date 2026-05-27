import { Request, Response, NextFunction } from "express";
import { authMiddleware } from "../../src/middlewares/authMiddleWare";
import { verifyToken } from "../../src/utils/jwtHelp";

jest.mock("../../src/utils/jwtHelp", () => ({
  verifyToken: jest.fn(),
}));

jest.mock("../../src/utils/logger", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe("authMiddleware", () => {
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    res = {};
    next = jest.fn();
  });

  it("doit accepter un token valide", () => {
    (verifyToken as jest.Mock).mockReturnValue({
      id: "user-1",
      email: "test@test.com",
    });

    const req = {
      headers: {
        authorization: "Bearer valid-token",
      },
      path: "/test",
    } as any;

    authMiddleware(req as Request, res as Response, next as NextFunction);

    expect(verifyToken).toHaveBeenCalledWith("valid-token");
    expect(req.user).toEqual({
      id: "user-1",
      email: "test@test.com",
    });
    expect(next).toHaveBeenCalledWith();
  });

  it("doit refuser si le header authorization est absent", () => {
    const req = {
      headers: {},
      path: "/test",
    } as any;

    authMiddleware(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it("doit refuser si le format Bearer est invalide", () => {
    const req = {
      headers: {
        authorization: "invalid-token",
      },
      path: "/test",
    } as any;

    authMiddleware(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});