import { Request, Response, NextFunction } from "express";
import { PurchaseService } from "../services/purchaseService";

const purchaseService = new PurchaseService();

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

      // USER FROM TOKEN
      const user = (req as any).user;

      const result = await purchaseService.purchaseTickets({
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

      const purchases =
        await purchaseService.getPurchaseHistory(user.id);

      res.status(200).json(purchases);

    } catch (error) {
      next(error);
    }
  }
}


// USER.ID

// import { Request, Response, NextFunction } from "express";
// import { PurchaseService } from "../services/purchaseService";

// const purchaseService = new PurchaseService();

// export class PurchaseController {

//   async purchaseTickets(
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ) {
//     try {

//       const result = await purchaseService.purchaseTickets({
//         user_id: req.body.user_id,
//         quantity: req.body.quantity,
//         unit_price: req.body.unit_price,
//         currency: req.body.currency,
//       });

//       res.status(201).json(result);

//     } catch (error) {
//       next(error);
//     }
//   }
// }