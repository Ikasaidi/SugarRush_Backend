import {
  Request,
  Response,
  NextFunction,
} from "express";

import { UserService } from "../services/UserService";

const userService = new UserService();

export class UserController {

  // ====================================================
  // GET CURRENT USER
  // ====================================================

  me = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {

    try {

      const userId =
        (req as any).user?.id;

      const user =
        await userService.getById(userId);

      res.status(200).json({
        success: true,
        user,
      });

    } catch (err) {

      next(err);

    }
  };

  // ====================================================
  // UPDATE CURRENT USER
  // ====================================================

  updateMe = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {

    try {

      const userId =
        (req as any).user?.id;

      const allowedFields = [
        "username",
        "fname",
        "lname",
        "phone",
        "address",
        "email",
        "password",
      ];

      const data: any = {};

      for (const key of allowedFields) {

        if (
          req.body[key] !== undefined &&
          req.body[key] !== null
        ) {
          data[key] = req.body[key];
        }
      }

      const updatedUser =
        await userService.updateUser(
          userId,
          data
        );

      res.status(200).json({
        success: true,
        user: updatedUser,
      });

    } catch (err) {

      next(err);

    }
  };

  // ====================================================
  // DELETE CURRENT USER
  // ====================================================

  deleteMe = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {

    try {

      const userId =
        (req as any).user?.id;

      await userService.deleteUser(
        userId
      );

      res.status(200).json({
        success: true,
        message: "Compte supprimé",
      });

    } catch (err) {

      next(err);

    }
  };

  // ====================================================
  // LOGOUT
  // ====================================================

  logout = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ) => {

    try {

      res.status(200).json({
        success: true,
        message: "Déconnecté",
      });

    } catch (err) {

      next(err);

    }
  };
}