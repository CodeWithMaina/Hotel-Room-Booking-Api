import { Request, Response } from "express";
import {
  getRoomsService,
  getRoomByIdService,
  createRoomService,
  updateRoomService,
  deleteRoomService,
} from "./room.service";
import { TRoomInsert, TRoomSelect } from "../drizzle/schema";

export const getRoomsController = async (req: Request, res: Response) => {
  try {
    const rooms = await getRoomsService();
    if (rooms == null || rooms.length === 0) {
      res.status(404).json({ message: "No rooms found" });
      return;
    }
    res.status(200).json({"Rooms": rooms});
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch rooms",
      error: error.message,
    });
  }
};

export const getRoomByIdController = async (req: Request, res: Response) => {
  try {
    const roomId = parseInt(req.params.id);
    if (isNaN(roomId)) {
      res.status(400).json({ message: "Invalid room ID" });
      return;
    }

    const room = await getRoomByIdService(roomId);
    if (!room) {
      res.status(404).json({ message: "Room not found" });
      return;
    }
    res.status(200).json(room);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch room",
      error: error.message,
    });
  }
};

export const createRoomController = async (req: Request, res: Response) => {
  try {
    const roomData: TRoomInsert = req.body;
    if (!roomData.roomType || !roomData.pricePerNight || !roomData.capacity || !roomData.hotelId) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const newRoom = await createRoomService(roomData);
    res.status(201).json(newRoom);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to create room",
      error: error.message,
    });
  }
};

export const updateRoomController = async (req: Request, res: Response) => {
  try {
    const roomId = parseInt(req.params.id);
    if (isNaN(roomId)) {
      res.status(400).json({ message: "Invalid room ID" });
      return;
    }

    const roomData: Partial<TRoomInsert> = req.body;
    if (Object.keys(roomData).length === 0) {
      res.status(400).json({ message: "No data provided for update" });
      return;
    }

    const updatedRoom = await updateRoomService(roomId, roomData);
    if (!updatedRoom) {
      res.status(404).json({ message: "Room not found" });
      return;
    }
    res.status(200).json(updatedRoom);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to update room",
      error: error.message,
    });
  }
};

export const deleteRoomController = async (req: Request, res: Response) => {
  try {
    const roomId = parseInt(req.params.id);
    if (isNaN(roomId)) {
      res.status(400).json({ message: "Invalid room ID" });
      return;
    }

    const deletedRoom = await deleteRoomService(roomId);
    if (!deletedRoom) {
      res.status(404).json({ message: "Room not found" });
      return;
    }
    res.status(200).json({ message: "Room deleted successfully" });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to delete room",
      error: error.message,
    });
  }
};