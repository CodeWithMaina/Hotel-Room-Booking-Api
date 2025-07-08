import { Router } from "express";
import { 
  createBookingController, 
  deleteBookingController, 
  getBookingByIdController, 
  getBookingsByUserIdController, 
  getBookingsController, 
  updateBookingController 
} from "./booking.controller";

export const bookingRouter = Router();

bookingRouter.get('/bookings', getBookingsController);
bookingRouter.get("/booking/:id", getBookingByIdController);
bookingRouter.post("/booking", createBookingController);
bookingRouter.put("/booking/:id", updateBookingController);
bookingRouter.delete("/booking/:id", deleteBookingController);
bookingRouter.get('/bookings/user/:userId', getBookingsByUserIdController);