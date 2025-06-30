import { Router } from "express";
import { 
  createPaymentController, 
  deletePaymentController, 
  getPaymentByIdController, 
  getPaymentsController, 
  updatePaymentController 
} from "./payment.controller";

export const paymentRouter = Router();

paymentRouter.get('/payments', getPaymentsController);
paymentRouter.get("/payment/:id", getPaymentByIdController);
paymentRouter.post("/payment", createPaymentController);
paymentRouter.put("/payment/:id", updatePaymentController);
paymentRouter.delete("/payment/:id", deletePaymentController);