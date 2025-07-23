// availability.controller.ts
import { Request, Response } from "express";
import { parseISO, isValid } from "date-fns";
import { checkRoomAvailabilityService } from "./availability.service";

export const checkRoomAvailabilityController = async (
  req: Request,
  res: Response
) => {
  try {
    const { checkInDate, checkOutDate, capacity } = req.query;

    // Validate required parameters
    if (!checkInDate || !checkOutDate) {
      res.status(400).json({
        success: false,
        message: "Both checkInDate and checkOutDate are required",
      });
      return;
    }

    // Parse and validate dates
    const parsedCheckIn = parseISO(checkInDate as string);
    const parsedCheckOut = parseISO(checkOutDate as string);

    if (!isValid(parsedCheckIn)) {
      res.status(400).json({
        success: false,
        message:
          "Invalid checkInDate format. Please use ISO format (YYYY-MM-DD)",
      });
      return;
    }

    if (!isValid(parsedCheckOut)) {
      res.status(400).json({
        success: false,
        message:
          "Invalid checkOutDate format. Please use ISO format (YYYY-MM-DD)",
      });
      return;
    }

    if (parsedCheckIn >= parsedCheckOut) {
      res.status(400).json({
        success: false,
        message: "checkOutDate must be after checkInDate",
      });
      return;
    }

    // Parse capacity if provided
    let parsedCapacity: number | undefined;
    if (capacity) {
      parsedCapacity = parseInt(capacity as string);
      if (isNaN(parsedCapacity) || parsedCapacity < 1) {
        res.status(400).json({
          success: false,
          message: "Capacity must be a positive integer if provided",
        });
        return;
      }
    }

    const availableRooms = await checkRoomAvailabilityService({
      checkInDate: parsedCheckIn,
      checkOutDate: parsedCheckOut,
      capacity: parsedCapacity,
    });

    res.status(200).json({
      success: true,
      data: availableRooms,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to check room availability",
      error: error.message,
    });
  }
};
