import { Router } from "express";
import { 
  createBookingController, 
  deleteBookingController, 
  getBookingByIdController, 
  getBookingsByStatusController, 
  getBookingsByUserIdController, 
  getBookingsController, 
  updateBookingController 
} from "./booking.controller";

export const bookingRouter = Router();

bookingRouter.get("/booking/:id", getBookingByIdController);
bookingRouter.post("/booking", createBookingController);
bookingRouter.put("/booking/:id", updateBookingController);
bookingRouter.delete("/booking/:id", deleteBookingController);

// GET /bookings?page=1&limit=10
bookingRouter.get('/bookings', getBookingsController);

// GET /bookings/user/123?page=1&limit=10
bookingRouter.get('/bookings/user/:userId', getBookingsByUserIdController);

bookingRouter.get('/bookings/status', getBookingsByStatusController);