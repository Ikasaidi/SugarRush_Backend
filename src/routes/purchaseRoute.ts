import { Router } from "express";
import { PurchaseController } from "../controllers/purchaseController";
import { authMiddleware } from "../middlewares/authMiddleWare"

const router = Router();

const purchaseController = new PurchaseController();

// ===========================================================
// BUY TICKETS
// ===========================================================
router.post(
  "/purchase",
  authMiddleware,
  purchaseController.purchaseTickets.bind(purchaseController)
);

// ===========================================================
// PURCHASE HISTORY
// ===========================================================
router.get(
  "/history",
  authMiddleware,
  purchaseController.getPurchaseHistory.bind(purchaseController)
);

export default router;

// USER.ID

// import { Router } from "express";
// import { PurchaseController } from "../controllers/purchaseController";

// const router = Router();

// const purchaseController = new PurchaseController();

// router.post(
//   "/purchase",
//   purchaseController.purchaseTickets.bind(purchaseController)
// );

// export default router;