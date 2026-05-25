import { Request, Response, NextFunction } from "express";
import { PurchaseService } from "../services/purchaseService";

// ====================== SINGLETON + INJECTION POUR TESTS ======================
let purchaseServiceInstance: PurchaseService | null = null;

const getPurchaseService = () => {
  if (!purchaseServiceInstance) {
    purchaseServiceInstance = new PurchaseService();
  }
  return purchaseServiceInstance;
};

export function setPurchaseServiceForTesting(service: PurchaseService) {
  purchaseServiceInstance = service;
}
// =============================================================================

export class PurchaseController {

  // ===========================================================
  // PURCHASE TICKETS
  // ===========================================================
  async purchaseTickets(
    req: Request,
    res: Response,
    next: NextFunction
  ) {

    try {
      // USER FROM TOKEN (ajouté par le middleware d'authentification)
      const user = (req as any).user;

      const result = await getPurchaseService().purchaseTickets({
        user_id: user.id,
        quantity: req.body.quantity,
        unit_price: req.body.unit_price,
        currency: req.body.currency,
      });

      res.status(201).json(result);

    } catch (error) {
      next(error);
    }
  }

  // ===========================================================
  // GET PURCHASE HISTORY
  // ===========================================================
  async getPurchaseHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ) {

    try {
      // USER FROM TOKEN
      const user = (req as any).user;

      const purchases = await getPurchaseService().getPurchaseHistory(user.id);

      res.status(200).json(purchases);

    } catch (error) {
      next(error);
    }
  }
}