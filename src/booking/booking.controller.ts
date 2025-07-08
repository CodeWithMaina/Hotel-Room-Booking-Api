import { Request, Response } from "express";
import {
  getBookingsService,
  getBookingByIdService,
  createBookingService,
  updateBookingService,
  deleteBookingService,
  getBookingsByUserIdService,
} from "./booking.service";
import { TBookingInsert } from "../drizzle/schema";
import { TBookingInsertForm } from "../types/bookingTypes";

export const getBookingsController = async (req: Request, res: Response) => {
  try {
    const bookings = await getBookingsService();
    if (bookings == null) {
      res.status(404).json({ message: "No bookings found" });
      return;
    }
    res.status(200).json({ Bookings: bookings });
  } catch (error: any) {
    res.status(500).json({
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

    bookingData = {
      ...bookingData,
      totalAmount: parseFloat(bookingData.totalAmount).toFixed(2),
    };

    const newBooking = await createBookingService(bookingData);
    res.status(201).json(newBooking);
    return;
  } catch (error: any) {
    console.error("Booking creation error:", error);
    res.status(500).json({
      message: "Failed to create booking",
      error: error.message || error,
    });
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

    if (isNaN(userId)) {
      res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
      return;
    }

    const bookings = await getBookingsByUserIdService(userId);

    if (!bookings || bookings.length === 0) {
      res.status(404).json({
        success: false,
        message: "No bookings found for this user",
      });
      return;
    }

    res.status(200).json(bookings);
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
