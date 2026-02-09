import { Request, Response, NextFunction } from "express";
import { HttpException } from "../utils/http-exception";

// ===========================================================
// ROLE MIDDLEWARE
// - Vérifie qu’un utilisateur authentifié possède le rôle requis
// - Exemple: roleMiddleware("admin")
// ===========================================================
export const roleMiddleware =
  (role: string) => (req: Request, res: Response, next: NextFunction) => {

    // L’auth middleware doit déjà avoir rempli req.user
    const user = (req as any).user; 
    if (!user) return next(new HttpException(401, "Non authentifié"));
    if (user.role !== role) return next(new HttpException(403, "Accès refusé"));
    next();
  };
