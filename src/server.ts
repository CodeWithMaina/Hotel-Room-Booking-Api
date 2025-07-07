import express, { Response } from "express";
import dotenv from "dotenv";
import { userRouter } from "./user/user.route";
import cors from "cors";
import { bookingRouter } from "./booking/booking.route";
import { hotelRouter } from "./hotel/hotel.route";
import { roomRouter } from "./room/room.route";
import { ticketRouter } from "./supportTicket/ticket.route";
import { paymentRouter } from "./payment/payment.route";
import { logger } from "./middleware/logger";
import { rateLimiterMiddleware } from "./middleware/rateLimiter";
import { authRouter } from "./auth/auth.route";
import { amenityRouter } from "./amenities/amenities.route";
import { addressRouter } from "./addresses/addresses.route";
import { entityAmenityRouter } from "./entityAmenities/enityAmenities.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Basic Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);
app.use(rateLimiterMiddleware);

//default route
app.get("/", (req, res: Response) => {
  res.send("Welcome to Hotel Room Booking Backend");
});

// Enable CORS for all routes
app.use(cors());

// Or configure specific origins
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

//import route
app.use("/api", authRouter);
app.use("/api", userRouter);
app.use("/api", bookingRouter);
app.use("/api", hotelRouter);
app.use("/api", roomRouter);
app.use("/api", ticketRouter);
app.use("/api", paymentRouter);
app.use("/api", amenityRouter);
app.use("/api", addressRouter);
app.use("/api", entityAmenityRouter);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
