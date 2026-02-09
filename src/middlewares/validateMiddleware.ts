import { Request, Response, NextFunction } from "express";
import { HttpException } from "../utils/http-exception";

// ===========================================================
// VALIDATION MIDDLEWARES (REGISTER / LOGIN / USER UPDATE)
// - Valident rapidement la présence de champs requis
// ===========================================================


// -----------------------------------------------------------
// REGISTER: email, username, password requis
// HTTP: 400 (param manquant) 
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
// LOGIN: email + password requis
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
// - Autorise username, location, password
// - Vérifie qu'au moins un champ est présent
// -----------------------------------------------------------
export const validateUserUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, location, password } = req.body;

  if (
    typeof username === "undefined" &&
    typeof location === "undefined" &&
    typeof password === "undefined"
  ) {
    throw new HttpException(400, "Aucun champ à mettre à jour");
  }

  next();
};

