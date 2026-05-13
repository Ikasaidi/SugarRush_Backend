import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/UserService";

const userService = new UserService();

export class UserController {

  // ====================================================
  // GET /api/users/me
  // ====================================================
  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      const user = await userService.getById(userId);

      res.status(200).json({
        success: true,
        user,
      });

    } catch (err) {
      next(err);
    }
  };

  // ====================================================
  // PATCH /api/users/me
  // ====================================================
  updateMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;

      // Filtrer les champs réellement envoyés
      const allowed = ["username", "fname", "lname", "phone", "address", "password", "user_type"];
      const data: any = {};

      for (const key of allowed) {
        if (req.body[key] !== undefined && req.body[key] !== null) {
          data[key] = req.body[key];
        }
      }

      const updatedUser = await userService.updateUser(userId, data);

      res.status(200).json({
        success: true,
        user: updatedUser,
      });

    } catch (err) {
      next(err);
    }
  };

  // ====================================================
  // DELETE /api/users/me
  // ====================================================
  deleteMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;

      await userService.deleteUser(userId);

      res.status(200).json({
        success: true,
        message: "Compte supprimé",
      });

    } catch (err) {
      next(err);
    }
  };

  // ====================================================
  // POST /api/users/logout
  // ====================================================
  logout = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      // JWT stateless → juste dire OK
      res.status(200).json({
        success: true,
        message: "Déconnecté",
      });

    } catch (err) {
      next(err);
    }
  };
}
