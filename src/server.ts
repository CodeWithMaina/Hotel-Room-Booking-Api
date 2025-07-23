import express, { Response } from "express";
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
import { stripeRouter } from "./stripe/stripe.routes"; // Important: must come before body parsers
import { contactRouter } from "./contact/contactRoutes";
import { availabilityRouter } from "./availability/availability.route";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use("/api", stripeRouter);

// Global middlewares (after Stripe raw body handling)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);
// app.use(rateLimiterMiddleware);

// CORS
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Default route
app.get("/", (req, res: Response) => {
  res.send("Welcome to Hotel Room Booking Backend");
});

// Other routes
// Use Stripe routes BEFORE global body parser!
app.use("/api", authRouter);
app.use("/api", userRouter);
app.use("/api", bookingRouter);
app.use("/api", hotelRouter);
app.use("/api", roomRouter);
app.use("/api", ticketRouter);
app.use("/api", paymentRouter);
app.use("/api", amenityRouter);
app.use("/api", contactRouter);
app.use("/api", availabilityRouter);
app.use("/api", wishlistRouter);
app.use("/api", analyticsRouter);
app.use("/api", addressRouter);
app.use("/api", entityAmenityRouter);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
