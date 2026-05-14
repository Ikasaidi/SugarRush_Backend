import {
  Request,
  Response,
  NextFunction,
} from "express";

import { UserService } from "../services/UserService";
import { HttpException } from "../utils/http-exception";

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
  // GET ALL NON-ADMIN USERS
  // ====================================================

  getAllNonAdminUsers = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ) => {

    try {

      const users =
        await userService.getAllNonAdminUsers();

      res.status(200).json({
        success: true,
        users,
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
  // DELETE USER BY ID (ADMIN)
  // ====================================================

  deleteUserById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {

    try {

      const targetUserId = String(req.params.targetUserId || "");

      if (!targetUserId) {
        throw new HttpException(
          400,
          "L'ID de l'utilisateur à supprimer est requis"
        );
      }

      await userService.deleteUser(targetUserId);

      res.status(200).json({
        success: true,
        message: "Utilisateur supprimé",
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

  // ====================================================
  // PROMOTE USER TO ADMIN
  // ====================================================

  promoteToAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {

    try {

      const { targetUserId } =
        req.body;

      if (!targetUserId) {
        throw new HttpException(
          400,
          "L'ID de l'utilisateur à promouvoir est requis"
        );
      }

      const promotedUser =
        await userService.promoteToAdmin(
          targetUserId
        );

      res.status(200).json({
        success: true,
        user: promotedUser,
      });

    } catch (err) {

      next(err);

    }
  };
}