// ===========================================================
// AUTH ROUTES
// - Inscription, Connexion, Promotion admin
// ===========================================================

import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleWare";
import {
  validateRegister,
  validateLogin,
} from "../middlewares/validateMiddleware";
import { roleMiddleware } from "../middlewares/roleMiddleware";

const router = Router();
const authController = new AuthController();

// -----------------------------------------------------------
// ROUTES
// -----------------------------------------------------------


// -----------------------------------------------------------
// POST /api/auth/register
// - Crée un compte utilisateur
// -----------------------------------------------------------
router.post("/register", validateRegister, authController.register);

// -----------------------------------------------------------
// POST /api/auth/login
// - Authentifie l’utilisateur ; renvoie un JWT
// -----------------------------------------------------------
router.post("/login", validateLogin, authController.login);


export default router;
