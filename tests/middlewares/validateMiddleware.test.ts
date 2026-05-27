import { Request, Response, NextFunction } from "express";
import {
  validateRegister,
  validateLogin,
  validateUserUpdate,
} from "../../src/middlewares/validateMiddleware";

describe("validateMiddleware", () => {
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    res = {};
    next = jest.fn();
  });

  it("validateRegister doit accepter un body valide", () => {
    const req = {
      body: {
        email: "test@test.com",
        username: "test",
        password: "123",
        fname: "a",
        lname: "b",
        phone: "123",
        address: "addr",
        user_type: "student",
      },
    } as Request;

    validateRegister(req, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith();
  });

  it("validateRegister doit refuser si champ manquant", () => {
    const req = {
      body: {
        email: "test@test.com",
      },
    } as Request;

    validateRegister(req, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it("validateRegister doit refuser un user_type invalide", () => {
    const req = {
      body: {
        email: "test@test.com",
        username: "test",
        password: "123",
        fname: "a",
        lname: "b",
        phone: "123",
        address: "addr",
        user_type: "bad-type",
      },
    } as Request;

    validateRegister(req, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it("validateLogin doit accepter email et password", () => {
    const req = {
      body: {
        email: "test@test.com",
        password: "123",
      },
    } as Request;

    validateLogin(req, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith();
  });

  it("validateLogin doit refuser si email ou password absent", () => {
    const req = {
      body: {
        email: "test@test.com",
      },
    } as Request;

    validateLogin(req, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it("validateUserUpdate doit accepter un champ autorisé", () => {
    const req = {
      body: {
        fname: "Ikram",
      },
    } as Request;

    validateUserUpdate(req, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith();
  });

  it("validateUserUpdate doit throw si body vide", () => {
    const req = {
      body: {},
    } as Request;

    expect(() =>
      validateUserUpdate(req, res as Response, next as NextFunction)
    ).toThrow("Aucun champ à mettre à jour");
  });

  it("validateUserUpdate doit throw si champ non autorisé", () => {
    const req = {
      body: {
        role: "admin",
      },
    } as Request;

    expect(() =>
      validateUserUpdate(req, res as Response, next as NextFunction)
    ).toThrow("Champs non autorisés: role");
  });
});