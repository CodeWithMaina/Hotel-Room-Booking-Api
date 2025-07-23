// availability.route.ts
import { Router } from "express";
import { checkRoomAvailabilityController } from "./availability.controller";

export const availabilityRouter = Router();

availabilityRouter.get("/rooms/availability", checkRoomAvailabilityController);

// GET /api/rooms/availability?checkInDate=2024-01-01&checkOutDate=2024-01-10
// GET /api/rooms/availability?checkInDate=2024-01-01&checkOutDate=2024-01-10&capacity=2