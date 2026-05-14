import { Request, Response, NextFunction } from "express";
import { HttpException } from "../utils/http-exception";
import { UserModel } from "../models/UsersModel";

// ===========================================================
// ROLE MIDDLEWARE
// - Vérifie qu'un utilisateur authentifié possède le rôle requis
// - Cherche l'utilisateur dans la DB pour vérifier le user_type
// - Exemple: roleMiddleware("admin")
// ===========================================================
export const roleMiddleware =
  (role: string) => async (req: Request, res: Response, next: NextFunction) => {

    // L'auth middleware doit déjà avoir rempli req.user
    const user = (req as any).user; 
    if (!user) return next(new HttpException(401, "Non authentifié"));
    
    try {
      // Récupérer l'utilisateur depuis la DB pour vérifier son user_type
      const dbUser = await UserModel.findById(user.id);
      
      if (!dbUser) {
        return next(new HttpException(404, "Utilisateur non trouvé"));
      }
      
      if (dbUser.user_type !== role) {
        return next(new HttpException(403, "Accès refusé - droits insuffisants"));
      }
      
      next();
    } catch (err) {
      next(new HttpException(500, "Erreur lors de la vérification des droits"));
    }
  };
