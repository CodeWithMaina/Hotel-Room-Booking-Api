import { Request, Response } from "express";
import {
  getBookingsService,
  getBookingByIdService,
  createBookingService,
  updateBookingService,
  deleteBookingService,
  getBookingsByUserIdService,
  getBookingsByStatusService,
} from "./booking.service";
import { TBookingInsert } from "../drizzle/schema";
import { TBookingInsertForm } from "../types/bookingTypes";
import { TBookingStatus } from "../types/types";


export const getBookingsController = async (req: Request, res: Response) => {
  try {
    // Get pagination parameters from query string with defaults
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    if (page < 1 || limit < 1) {
      res.status(400).json({ 
        success: false,
        message: "Page and limit must be positive numbers" 
      });
      return;
    }
    
    const result = await getBookingsService({ page, limit });
    
    if (result.data.length === 0) {
      res.status(404).json({ 
        success: false,
        message: "No bookings found" 
      });
      return;
    }
    
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
};

export const getBookingByIdController = async (req: Request, res: Response) => {
  try {
    const bookingId = parseInt(req.params.id);
    if (isNaN(bookingId)) {
      res.status(400).json({ message: "Invalid booking ID" });
      return;
    }

    const booking = await getBookingByIdService(bookingId);
    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }
    res.status(200).json(booking);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch booking",
      error: error.message,
    });
  }
};

export const createBookingController = async (req: Request, res: Response) => {
  try {
    let bookingData: TBookingInsertForm = req.body;

    // Basic required fields check
    if (
      !bookingData.userId ||
      !bookingData.roomId ||
      !bookingData.checkInDate ||
      !bookingData.checkOutDate ||
      !bookingData.totalAmount
    ) {
       res.status(400).json({ message: "Missing required fields" });
       return;
    }

    // Ensure consistent decimal format for total
    bookingData = {
      ...bookingData,
      totalAmount: parseFloat(bookingData.totalAmount).toFixed(2),
    };

    const newBooking = await createBookingService(bookingData);
     res.status(201).json(newBooking);
     return;
  } catch (error: any) {
    const errorMessage = error.message || "An unexpected error occurred";

    // Handle expected user input or business logic errors
    if (
      errorMessage.includes("Room not found") ||
      errorMessage.includes("is not available") ||
      errorMessage.includes("Invalid") ||
      errorMessage.includes("Check-out must be after check-in") ||
      errorMessage.includes("already booked")
    ) {
      const statusCode = errorMessage.includes("already booked") ? 409 : 400;

       res.status(statusCode).json({
        message: "Booking validation failed",
        error: errorMessage,
      });
      return;
    }

    // For unexpected system/database errors
    console.error("Booking creation error:", error);
     res.status(500).json({
      message: "Failed to create booking",
      error: errorMessage,
    });
    return
  }
};


export const updateBookingController = async (req: Request, res: Response) => {
  try {
    const bookingId = parseInt(req.params.id);
    if (isNaN(bookingId)) {
      res.status(400).json({ message: "Invalid booking ID" });
      return;
    }

    const bookingData: Partial<TBookingInsert> = req.body;
    if (Object.keys(bookingData).length === 0) {
      res.status(400).json({ message: "No data provided for update" });
      return;
    }

    const updatedBooking = await updateBookingService(bookingId, bookingData);
    if (!updatedBooking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }
    res.status(200).json(updatedBooking);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to update booking",
      error: error.message,
    });
  }
};

export const deleteBookingController = async (req: Request, res: Response) => {
  try {
    const bookingId = parseInt(req.params.id);
    if (isNaN(bookingId)) {
      res.status(400).json({ message: "Invalid booking ID" });
      return;
    }

    const deletedBooking = await deleteBookingService(bookingId);
    if (!deletedBooking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }
    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to delete booking",
      error: error.message,
    });
  }
};

export const getBookingsByUserIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = parseInt(req.params.userId);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (isNaN(userId)) {
      res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
      return;
    }
    
    if (page < 1 || limit < 1) {
      res.status(400).json({ 
        success: false,
        message: "Page and limit must be positive numbers" 
      });
      return;
    }

    const result = await getBookingsByUserIdService(userId, { page, limit });

    if (result.data.length === 0) {
      res.status(404).json({
        success: false,
        message: "No bookings found for this user",
      });
      return;
    }

    res.status(200).json(result);
    return;
  } catch (error: any) {
    console.error("Error fetching bookings by user ID:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve bookings",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
    return;
  }
};

export const getBookingsByStatusController = async (req: Request, res: Response) => {
  try {
    // Get pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Get status filter (can be single string or array)
    let status: TBookingStatus[] = [];
    if (req.query.status) {
      const statusParam = req.query.status;
      status = Array.isArray(statusParam) 
        ? statusParam.map(s => s.toString() as TBookingStatus)
        : [statusParam.toString() as TBookingStatus];
    } else {
      // Default to all statuses if none provided
      status = ['Pending', 'Confirmed', 'Cancelled'];
    }

    if (page < 1 || limit < 1) {
      res.status(400).json({ 
        success: false,
        message: "Page and limit must be positive numbers" 
      });
      return;
    }

    const result = await getBookingsByStatusService({ 
      page, 
      limit, 
      status 
    });

    if (result.data.length === 0) {
      res.status(404).json({ 
        success: false,
        message: "No bookings found with the specified status" 
      });
      return;
    }

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings by status",
      error: error.message,
    });
  }
};