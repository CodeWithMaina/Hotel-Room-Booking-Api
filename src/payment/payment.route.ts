import { Router } from "express";
import { 
  createPaymentController, 
  deletePaymentController, 
  getPaymentByBookingId, 
  getPaymentByIdController, 
  getPaymentsByUserIdController, 
  getPaymentsController, 
  updatePaymentController 
} from "./payment.controller";

export const paymentRouter = Router();

paymentRouter.get('/payments', getPaymentsController);
paymentRouter.get("/payment/:id", getPaymentByIdController);
paymentRouter.post("/payment", createPaymentController);
paymentRouter.put("/payment/:id", updatePaymentController);
paymentRouter.delete("/payment/:id", deletePaymentController);
paymentRouter.get("/payment/user/:userId", getPaymentsByUserIdController);
paymentRouter.get("/payment/:bookingId", getPaymentByBookingId);