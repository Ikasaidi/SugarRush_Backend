import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/UserService";

// USER CONTROLLER
// - Expose les handlers HTTP pour l'utilisateur courant
// - Nécessite authMiddleware (req.user.id)

const userService = new UserService();

export class UserController {

  // GET /api/users/me
  // - Retourne les infos du compte (sans password)
  
  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id as string;
      const user = await userService.getById(userId);
      res.status(200).json({ success: true, user });
    } catch (err) {
      next(err);
    }
  };

  
  // PATCH /api/users/me
  // - Met à jour username/password
  // - validateUserUpdate protège les entrées

  updateMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;

    
      const { username, fname, lname, phone, address, password } = req.body;

      const updated = await userService.updateUser(userId, {
        username,
        fname,
        lname,
        phone,
        address,
        password,
      });

      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  };

  // DELETE /api/users/me
  // - Supprime le compte courant
 
  deleteMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id as string;

       console.log("DELETE /users/me called");
      console.log("User ID from token:", userId);
      await userService.deleteUser(userId);
      res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  };


  // POST /api/users/logout
  // - Logout stateless: côté client, retirer le token

  logout = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      // JWT stateless: côté client, supprimer le token (localStorage/cookie)
      const result = await userService.logout();
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };
}
