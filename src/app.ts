import express from "express";
import dotenv from "dotenv";
import authRoute from "./routes/authRoute"
import config from "config";
import userRoute from "./routes/userRoute";
import QrCodeRoute from "./routes/QrCodeRoute"
import iotEventsRoutes from "./routes/iotEventsRoute";
import purchaseRoute from "./routes/purchaseRoute";
import walletRoute from "./routes/walletRoute";
import trainStatusRoutes from "./routes/trainStatusRoutes";
import trainSchedulesRoutes from "./routes/trainSchedulesRoutes";
import { errorMiddleware } from "./middlewares/errorMiddleWare";
import c from "config";
import cors from "cors";
import bodyParser from 'body-parser';
import rateLimit , {RateLimitRequestHandler}from "express-rate-limit";

dotenv.config();
const app = express();
app.use(express.json());



/// Pour povoir envoyer des images en base64 (taille max augmentée) ///
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Configuration CORS
const corsOrigins = config.get<string[]>("security.cors.origins");
app.use(cors({
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origine (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Autoriser les origines configurées
    if (corsOrigins.includes(origin) || corsOrigins.includes("*")) {
      return callback(null, true);
    }
    
    // Pour le développement, autoriser localhost et 127.0.0.1 sur n'importe quel port
    if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
      return callback(null, true);
    }
    
    callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));


// -----------------------------------------------------------
//  RATE LIMITING
// -----------------------------------------------------------
const rateConfig = config.get<{
  windowMs: number | string;
  max: number | string;
}>("security.rateLimit");

const rateLimitWindowMs = Number(rateConfig.windowMs);
const rateLimitMax = Number(rateConfig.max);

const limiter: RateLimitRequestHandler = rateLimit({
  windowMs: rateLimitWindowMs,
  max: rateLimitMax,
  message: "Trop de requêtes, réessayez plus tard.",
});
// -----------------------------------------------------------
//  MIDDLEWARE
// -----------------------------------------------------------
app.use(bodyParser.json());

// =====================================================
// GLOBAL ERROR HANDLER (erreur de login qui  ne doit pas faire planter le serveur a ause du non json)
// =====================================================
app.use((err: any, req: any, res: any, next: any) => {

  console.error("GLOBAL ERROR:", err);

  const status = err.status || 500;

  res.status(status).json({
    message: err.message || "Server error",
  });
});




//------------ ROUTES ------------//
// Home
app.get("/", (req, res) => {
  res.send(` helloo
  `);
});

// Auth 
app.use("/api/auth", limiter, authRoute);

// user
app.use("/api/users", userRoute);

//QR Code
app.use('/api/qr-code', QrCodeRoute);
// IoT Events
app.use("/api/iot", iotEventsRoutes);
app.use("/api/train-schedules", trainSchedulesRoutes);
app.use("/api/train-status", trainStatusRoutes);

app.use("/api/purchases", purchaseRoute);

// Wallet
app.use("/api/wallet", walletRoute);

app.use(errorMiddleware);

export default app;