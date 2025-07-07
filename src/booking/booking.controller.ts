import { Request, Response } from "express";
import {
  getBookingsService,
  getBookingByIdService,
  createBookingService,
  updateBookingService,
  deleteBookingService,
} from "./booking.service";
import { TBookingInsert } from "../drizzle/schema";
import { TBookingInsertForm } from "../types/bookingTypes";

export const getBookingsController = async (req: Request, res: Response) => {
  try {
    const bookings = await getBookingsService();
    if (bookings == null || bookings.length === 0) {
      res.status(404).json({ message: "No bookings found" });
      return;
    }
    res.status(200).json({"Bookings": bookings});
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

    // ✅ Coerce totalAmount to string safely
    bookingData = {
      ...bookingData,
      totalAmount: parseFloat(bookingData.totalAmount).toFixed(2), // ensure string format
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

// export const createBookingController = async (req: Request, res: Response) => {
//   try {
//     const bookingData: TBookingInsertForm = req.body;
//     if (!bookingData.userId || !bookingData.roomId || !bookingData.checkInDate || 
//         !bookingData.checkOutDate || !bookingData.totalAmount) {
//       res.status(400).json({ message: "Missing required fields" });
//       return;
//     }

//     const newBooking = await createBookingService(bookingData);
//     res.status(201).json(newBooking);
//   } catch (error: any) {
//     res.status(500).json({
//       message: "Failed to create booking",
//       error: error.message,
//     });
//   }
// };

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