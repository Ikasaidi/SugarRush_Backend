import { Request, Response, NextFunction } from "express";
import { errorMiddleware } from "../../src/middlewares/errorMiddleWare";
import { HttpException } from "../../src/utils/http-exception";

describe("errorMiddleware", () => {
  let req: Request;
  let res: any;
  let next: NextFunction;

  beforeEach(() => {
    req = {} as Request;
    next = jest.fn();

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("doit retourner une erreur HttpException", () => {
    const err = new HttpException(401, "Non autorisé");

    errorMiddleware(err, req, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Non autorisé",
    });
  });

  it("doit retourner 500 pour une erreur normale", () => {
    const err = new Error("Erreur serveur");

    errorMiddleware(err, req, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Erreur serveur",
    });
  });
});