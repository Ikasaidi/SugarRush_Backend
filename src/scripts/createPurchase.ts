import { connectDB } from "../data/connectDB";
import { PurchaseService } from "../services/purchaseService";

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error("Usage: ts-node src/scripts/createPurchase.ts <userId> [amount1,amount2,...]");
    process.exit(1);
  }

  const userId = String(args[0] || "");
  const amountsArg = String(args[1] || "15,20,10");
  const amounts = amountsArg.split(",").map((s) => Number(s.trim())).filter(Boolean);

  const service = new PurchaseService();

  // connect to DB
  await connectDB();

  for (const amount of amounts) {
    try {
      const res = await service.purchaseTickets({
        user_id: userId,
        quantity: 1,
        unit_price: amount,
        currency: "EUR",
      });

      console.log("Created purchase:", res.purchase?._id || res.purchase);
      console.log("Wallet now:", res.wallet?.paid_ticket_balance, "paid tickets");
    } catch (err: any) {
      console.error("Error creating purchase:", err?.message || err);
    }
  }

  process.exit(0);
}

main();
