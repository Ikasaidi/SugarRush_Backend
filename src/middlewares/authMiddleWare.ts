import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwtHelp";
import { HttpException } from "../utils/http-exception";
import { logger } from "../utils/logger";

// ===========================================================
// AUTH MIDDLEWARE
// - Vérifie la présence et la validité du JWT ("Bearer <token>")
// - Attache les infos utilisateur décodées dans req.user
// ===========================================================
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    // -------------------------------------------------------
    // 1) Récupération de l'en-tête Authorization
    // -------------------------------------------------------
    const authHeader = req.headers.authorization;
    
    // Log pour déboguer
    logger.info(`Auth attempt - Path: ${req.path}, Has Auth: ${!!authHeader}`);

    // On attend "Bearer <token>"
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn(`Auth failed - Missing or invalid header format`);
      throw new HttpException(401, "Token manquant ou invalide");
    }

     // -------------------------------------------------------
    // 2) Extraction du token
    // -------------------------------------------------------
    const token = authHeader.split(" ")[1] as string;

    // -------------------------------------------------------
    // 3) Vérification / décodage
    // -------------------------------------------------------
    const decoded = verifyToken(token);

    // -------------------------------------------------------
    // 4) Injection dans req pour les contrôleurs suivants
    // -------------------------------------------------------
    (req as any).user = decoded;

    logger.info(
      `Authentification réussie pour userId=${decoded?.id || "inconnu"}`
    );

    next();
  } catch (err) {
    next(err);
  }
};
