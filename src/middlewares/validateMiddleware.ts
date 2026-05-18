import { Request, Response, NextFunction } from "express";
import { HttpException } from "../utils/http-exception";

// ===========================================================
// VALIDATION MIDDLEWARES (REGISTER / LOGIN / USER UPDATE)
// ===========================================================

// -----------------------------------------------------------
// REGISTER
// -----------------------------------------------------------
export const validateRegister = (req: Request, _res: Response, next: NextFunction) => {
  const { email, username, password, fname, lname, phone, address, user_type } = req.body;

  if (!email || !username || !password || !fname || !lname || !phone || !address || !user_type) {
    return next(new HttpException(400, "Tous les champs sont obligatoires"));
  }

  const allowedTypes = ["student", "adult", "senior", "admin"];
  if (!allowedTypes.includes(user_type)) {
    return next(new HttpException(400, "Type d'utilisateur invalide"));
  }

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
    "user_type",
  ];

  const keys = Object.keys(req.body);

  if (keys.length === 0) {
    throw new HttpException(400, "Aucun champ à mettre à jour");
  }

  const invalid = keys.filter((key) => !allowedFields.includes(key));

  if (invalid.length > 0) {
    throw new HttpException(400, `Champs non autorisés: ${invalid.join(", ")}`);
  }

  next();
};