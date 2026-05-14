import {
  Request,
  Response,
  NextFunction,
} from "express";

import { AuthService } from "../services/authService";

const authService = new AuthService();

export class AuthController {

  // ====================================================
  // REGISTER
  // ====================================================

  register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {

    try {

      const {
        email,
        username,
        password,
        user_type,
        fname,
        lname,
        phone,
        address,
      } = req.body;

      const result =
        await authService.register({
          email,
          username,
          password,
          user_type,
          fname,
          lname,
          phone,
          address,
        });

      res.status(201).json({
        success: true,
        ...result,
      });

    } catch (err) {

      next(err);

    }
  };

  // ====================================================
  // LOGIN
  // ====================================================

  login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {

    try {

      const {
        email,
        password,
      } = req.body;

      const result =
        await authService.login(
          email,
          password
        );

      res.status(200).json({
        success: true,
        ...result,
      });

    } catch (err) {

      next(err);

    }
  };
}