import { Request, Response, NextFunction } from "express";
import { HttpException } from "../utils/http-exception";

// ===========================================================
// VALIDATION MIDDLEWARES (REGISTER / LOGIN / USER UPDATE)
// ===========================================================

// -----------------------------------------------------------
// REGISTER
// -----------------------------------------------------------
export const validateRegister = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const { email, username, password } = req.body;
  if (!email || !username || !password)
    return next(new HttpException(400, "Champs manquants pour l'inscription"));
  next();
};

// -----------------------------------------------------------
// LOGIN
// -----------------------------------------------------------
export const validateLogin = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new HttpException(400, "Email et mot de passe requis"));
  next();
};

// -----------------------------------------------------------
// UPDATE USER
// - Autorise fname, lname, phone, address, email, username, password
// -----------------------------------------------------------
export const validateUserUpdate = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const allowedFields = [
    "fname",
    "lname",
    "phone",
    "address",
    "email",
    "username",
    "password",
  ];

  const keys = Object.keys(req.body);

  // Aucun champ envoyé
  if (keys.length === 0) {
    throw new HttpException(400, "Aucun champ à mettre à jour");
  }

  // Vérifier si des champs non autorisés sont présents
  const invalid = keys.filter((key) => !allowedFields.includes(key));

  if (invalid.length > 0) {
    throw new HttpException(
      400,
      `Champs non autorisés: ${invalid.join(", ")}`
    );
  }

  next();
};
