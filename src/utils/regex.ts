import { z } from "zod";


//======== REGEX ========//
export const regex = {
  emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  usernameRegex: /^[a-zA-Z0-9._-]{3,30}$/,
  nameRegex: /^[a-zA-ZÀ-ÿ0-9 .,'-]{1,100}$/,
  passwordRegex:
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]).{8,}$/,
  objectIdRegex: /^[0-9a-fA-F]{24}$/,
  currencyRegex: /^[A-Z]{3}$/ // CAD, USD, EUR...
};

//======== CONSTRAINTS ========//
export const constraints = {
  username: { min: 3, max: 30 },
  name: { min: 1, max: 100 },
  password: { min: 8 },
  qrCode: { min: 10, max: 500 },
  station: { min: 2, max: 100 },
  trainId: { min: 1, max: 50 }
};

//======== VALIDATORS ========//
export const validators = {
  sanitizeText: (text: string): string =>
    text.replace(/<[^>]*>?/gm, "").slice(0, 500),
};

//======== COMMON SCHEMAS =======//
export const objectIdSchema = z
  .string()
  .regex(regex.objectIdRegex, "ObjectId invalide");

//======== USER SCHEMA (IUser) =======//
export const userZodSchema = z.object({
  username: z
    .string()
    .min(constraints.username.min, "Username too short")
    .max(constraints.username.max, "Username too long")
    .regex(regex.usernameRegex, "Username contains invalid characters"),

  email: z.string().regex(regex.emailRegex, "Email invalid"),

  password: z.string().regex(
    regex.passwordRegex,
    "Password is invalid (8+ characters, uppercase, number, symbol)"
  ),

  user_type: z.enum(["student", "adult", "senior"], {
    message: "User type is invalid",
  }),

  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});

//======== AUTH SCHEMA (IAuth) =======//
export const authZodSchema = z.object({
  user_id: objectIdSchema,
  password_hash: z.string().min(constraints.password.min, "Hashed Password invalid"),
  token_expires_at: z.coerce.date().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});

//======== PURCHASES SCHEMA (IPurchases) =======//
export const purchasesZodSchema = z
  .object({
    user_id: objectIdSchema,

    quantity: z.number().int().positive("Quantity must be positive"),

    unit_price: z.number().positive("Unit price must be positive"),

    total_amount: z.number().positive("Total amount must be positive"),

    currency: z
      .string()
      .regex(
        regex.currencyRegex,
        "Currency must be in ISO format (ex: CAD, USD)",
      ),

    status: z.enum(["pending", "completed", "failed"], {
      message: "Status is invalid",
    }),

    created_at: z.coerce.date().optional(),
  })
  .refine((data) => data.total_amount === data.quantity * data.unit_price, {
    message: "Total amount must be equal to quantity × unit_price",
    path: ["total_amount"],
  });

//======== TICKETS SCHEMA (ITickets) ========//
export const ticketsZodSchema = z.object({
  user_id: objectIdSchema,
  train_schedule_id: objectIdSchema,

  ticket_type: z.enum(["paid", "free"], {
    message: "Ticket type is invalid",
  }),

  qr_code: z
    .string()
    .min(constraints.qrCode.min, "QR code is too short")
    .max(constraints.qrCode.max, "QR code is too long"),

  is_used: z.boolean(),

  purchased_at: z.coerce.date().optional(),
  used_at: z.coerce.date().optional(),
});

//======== TRAIN EVENTS SCHEMA (ITrainEvents) ========//
export const trainEventsZodSchema = z.object({
  train_schedule_id: objectIdSchema,

  station: z
    .string()
    .min(constraints.station.min, "Station name is too short")
    .max(constraints.station.max, "Station name is too long")
    .regex(regex.nameRegex, "Station name contains invalid characters"),

  event_type: z.enum(["arrival", "departure"], {
    message: "Event type is invalid",
  }),

  details: z.string().transform(validators.sanitizeText).optional(),

  event_time: z.coerce.date().optional(),
});

//======== TRAIN SCHEDULES SCHEMA (ITrainSchedules) ========//
export const trainSchedulesZodSchema = z.object({
  train_id: z
    .string()
    .min(constraints.trainId.min, "Train ID is invalid")
    .max(constraints.trainId.max, "Train ID is too long"),

  departure_station: z
    .string()
    .regex(regex.nameRegex, "Departure station is invalid"),

  arrival_station: z
    .string()
    .regex(regex.nameRegex, "Arrival station is invalid"),
  departure_time: z.coerce.date(),
  arrival_time: z.coerce.date(),

  created_at: z.coerce.date().optional(),
});

//======== WALLET SCHEMA (IWallet) ========//
export const walletZodSchema = z.object({
  user_id: objectIdSchema,

  free_ticket_balance: z
    .number()
    .int()
    .min(0, "Free tickets balance cannot be negative"),

  paid_ticket_balance: z
    .number()
    .int()
    .min(0, "Paid ticket balance cannot be negative"),

  updated_at: z.coerce.date().optional(),
});

