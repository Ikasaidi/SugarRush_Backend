import { Router } from "express";
import { UserController } from "../controllers/userController";
import { authMiddleware } from "../middlewares/authMiddleWare";
import { roleMiddleware } from "../middlewares/roleMiddleware";
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

// GET /api/users/non-admins - récupérer tous les utilisateurs non-admin (admin only)
router.get(
	"/non-admins",
	authMiddleware,
	roleMiddleware("admin"),
	userController.getAllNonAdminUsers
);

// PATCH /api/users/me - mise à jour du compte courant
router.patch("/me", authMiddleware, validateUserUpdate, userController.updateMe);

// DELETE /api/users/me - suppression du compte courant
router.delete("/me", authMiddleware, userController.deleteMe);

// DELETE /api/users/:targetUserId - suppression d'un utilisateur par un admin
router.delete(
	"/:targetUserId",
	authMiddleware,
	roleMiddleware("admin"),
	userController.deleteUserById
);

// POST /api/users/logout - logout stateless (client supprime le token)
router.post("/logout", authMiddleware, userController.logout);

// POST /api/users/promote-to-admin - promouvoir un utilisateur en admin (admin only)
router.post("/promote-to-admin", authMiddleware, roleMiddleware("admin"), userController.promoteToAdmin);

export default router;
