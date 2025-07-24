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

// 1. CORS
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// 2. Stripe webhook route (⚠️ must be raw body — DO NOT parse as JSON)
app.post("/api/webhook", express.raw({ type: 'application/json' }), webhookHandler);

// 3. Logger middleware
app.use(logger);

// 4. JSON and URL-encoded parsers for other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. Routes
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

// 6. Stripe-specific routes (not webhook)
app.use("/api", stripeRouter);

// 7. Default health check
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Hotel Room Booking Backend");
});

// 8. Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
