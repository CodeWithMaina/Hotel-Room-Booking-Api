import { Request, Response } from "express";
import {
  getPaymentsService,
  getPaymentByIdService,
  createPaymentService,
  updatePaymentService,
  deletePaymentService,
} from "./payment.service";
import { TPaymentInsert } from "../drizzle/schema";

export const getPaymentsController = async (req: Request, res: Response) => {
  try {
    const payments = await getPaymentsService();
    if (payments == null || payments.length === 0) {
      res.status(404).json({ message: "No payments found" });
      return;
    }
    res.status(200).json({"Payments": payments});
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch payments",
      error: error.message,
    });
  }
};

export const getPaymentByIdController = async (req: Request, res: Response) => {
  try {
    const paymentId = parseInt(req.params.id);
    if (isNaN(paymentId)) {
      res.status(400).json({ message: "Invalid payment ID" });
      return;
    }

    const payment = await getPaymentByIdService(paymentId);
    if (!payment) {
      res.status(404).json({ message: "Payment not found" });
      return;
    }
    res.status(200).json(payment);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch payment",
      error: error.message,
    });
  }
};

export const createPaymentController = async (req: Request, res: Response) => {
  try {
    const paymentData: TPaymentInsert = req.body;
    if (!paymentData.bookingId || !paymentData.amount || !paymentData.paymentStatus) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const newPayment = await createPaymentService(paymentData);
    res.status(201).json(newPayment);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to create payment",
      error: error.message,
    });
  }
};

export const updatePaymentController = async (req: Request, res: Response) => {
  try {
    const paymentId = parseInt(req.params.id);
    if (isNaN(paymentId)) {
      res.status(400).json({ message: "Invalid payment ID" });
      return;
    }

    const paymentData: Partial<TPaymentInsert> = req.body;
    if (Object.keys(paymentData).length === 0) {
      res.status(400).json({ message: "No data provided for update" });
      return;
    }

    const updatedPayment = await updatePaymentService(paymentId, paymentData);
    if (!updatedPayment) {
      res.status(404).json({ message: "Payment not found" });
      return;
    }
    res.status(200).json(updatedPayment);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to update payment",
      error: error.message,
    });
  }
};

export const deletePaymentController = async (req: Request, res: Response) => {
  try {
    const paymentId = parseInt(req.params.id);
    if (isNaN(paymentId)) {
      res.status(400).json({ message: "Invalid payment ID" });
      return;
    }

    const deletedPayment = await deletePaymentService(paymentId);
    if (!deletedPayment) {
      res.status(404).json({ message: "Payment not found" });
      return;
    }
    res.status(200).json({ message: "Payment deleted successfully" });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to delete payment",
      error: error.message,
    });
  }
};
