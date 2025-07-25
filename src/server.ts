import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";

import { userRouter } from "./user/user.route";
import { bookingRouter } from "./booking/booking.route";
import { hotelRouter } from "./hotel/hotel.route";
import { roomRouter } from "./room/room.route";
import { ticketRouter } from "./supportTicket/ticket.route";
import { paymentRouter } from "./payment/payment.route";
import { logger } from "./middleware/logger";
import { authRouter } from "./auth/auth.route";
import { amenityRouter } from "./amenities/amenities.route";
import { addressRouter } from "./addresses/addresses.route";
import { entityAmenityRouter } from "./entityAmenities/enityAmenities.routes";
import { analyticsRouter } from "./analytics/analytics.route";
import { wishlistRouter } from "./wishlist/wishlist.route";
import { stripeRouter } from "./stripe/stripe.routes";
import { contactRouter } from "./contact/contact.routes";
import { availabilityRouter } from "./availability/availability.route";
import { newsletterRouter } from "./newletter/newsletter.route";
import { webhookHandler } from "./stripe/stripe.webhook";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 🧪 Health Check
app.get("/", (req: Request, res: Response) => {
  res.send("✅ Hotel Room Booking Backend is running.");
});

// 🚨 Stripe Webhook: must come BEFORE express.json()
app.post(
  "/api/webhook",
  (req, res, next) => {
    // 🚫 Disable compression if Render applies any
    res.set("Content-Encoding", "identity");
    next();
  },
  express.raw({ type: "application/json" }),
  webhookHandler
);

// 🔐 CORS
app.use(
  cors({
    origin: ["http://localhost:5173"], // Change for production
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// 🧾 Logging
app.use(logger);

// 🔍 Body Parsers (for all other routes)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 📦 API Routes
app.use("/api", authRouter);
app.use("/api", userRouter);
app.use("/api", bookingRouter);
app.use("/api", hotelRouter);
app.use("/api", roomRouter);
app.use("/api", ticketRouter);
app.use("/api", paymentRouter);
app.use("/api", amenityRouter);
app.use("/api", contactRouter);
app.use("/api", newsletterRouter);
app.use("/api", availabilityRouter);
app.use("/api", wishlistRouter);
app.use("/api", analyticsRouter);
app.use("/api", addressRouter);
app.use("/api", entityAmenityRouter);
app.use("/api", stripeRouter);

// 🚀 Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
