import { Router } from "express";
import { UserController } from "../controllers/userController";
import { authMiddleware } from "../middlewares/authMiddleWare";
import { validateUserUpdate } from "../middlewares/validateMiddleware";

// ===========================================================
// USER ROUTES
// - Routes protégées pour l'utilisateur courant
// - Requièrent un JWT valide via authMiddleware
// ===========================================================
const router = Router();
const userController = new UserController();

// GET /api/users/me - infos du compte courant
router.get("/me", authMiddleware, userController.me);

// PATCH /api/users/me - mise à jour du compte courant
router.patch("/me", authMiddleware, validateUserUpdate, userController.updateMe);

// DELETE /api/users/me - suppression du compte courant
router.delete("/me", authMiddleware, userController.deleteMe);

// POST /api/users/logout - logout stateless (client supprime le token)
router.post("/logout", authMiddleware, userController.logout);

export default router;
