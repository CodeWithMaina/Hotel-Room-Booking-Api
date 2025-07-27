import { Request, Response } from "express";
import {
  getRoomsService,
  getRoomByIdService,
  createRoomService,
  updateRoomService,
  deleteRoomService,
  getRoomByHotelIdService,
  getRoomWithAmenitiesService,
  getAvailableRoomsOnDatesService,
} from "./room.service";
import { TRoomInsert, TRoomSelect } from "../drizzle/schema";

export const getRoomsController = async (req: Request, res: Response) => {
  try {
    const rooms = await getRoomsService();
    if (rooms == null || rooms.length === 0) {
      res.status(404).json({ message: "No rooms found" });
      return;
    }
    res.status(200).json(rooms);
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
    if (!roomData.roomTypeId || !roomData.pricePerNight || !roomData.capacity || !roomData.hotelId) {
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

    // Handle both nested and flat structures
    const requestBody = req.body;
    const roomData = requestBody.roomData || requestBody;
    
    // Convert string dates to Date objects
    if (roomData.createdAt && typeof roomData.createdAt === 'string') {
      roomData.createdAt = new Date(roomData.createdAt);
    }
    
    // Validate required fields
    if (!roomData || Object.keys(roomData).length === 0) {
      res.status(400).json({ message: "No data provided for update" });
      return;
    }

    // Ensure pricePerNight is a string if provided
    if (roomData.pricePerNight !== undefined) {
      roomData.pricePerNight = String(roomData.pricePerNight);
    }

    const updatedRoom = await updateRoomService(roomId, roomData);
    if (!updatedRoom) {
      res.status(404).json({ message: "Room not found" });
      return;
    }
    
    // Fetch the full room with amenities to return
    const roomWithAmenities = await getRoomWithAmenitiesService(roomId);
    
    res.status(200).json(roomWithAmenities);
  } catch (error: any) {
    console.error('Error in updateRoomController:', error);
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


export const getRoomByHotelIdController = async (req: Request, res: Response) => {
  try {
    const hotelId = parseInt(req.params.id);
    if (isNaN(hotelId)) {
      res.status(400).json({ message: "Invalid hotel ID" });
      return;
    }

    const rooms = await getRoomByHotelIdService(hotelId);
    if (!rooms) {
      res.status(404).json({ message: "Room not found" });
      return;
    }
    res.status(200).json(rooms);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch room",
      error: error.message,
    });
  }
};

export const getRoomWithAmenitiesController = async (req: Request, res: Response) => {
  try {
    const roomId = parseInt(req.params.id);
    if (isNaN(roomId)) {
       res.status(400).json({ message: "Invalid room ID" });
       return;
    }

    const roomDetails = await getRoomWithAmenitiesService(roomId);
    if (!roomDetails) {
       res.status(404).json({ message: "Room not found" });
       return;
    }

    res.status(200).json(roomDetails);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch room details",
      error: error.message,
    });
  }
};


// Controller
export const getAvailableRoomsController = async (
  req: Request,
  res: Response
) => {
  try {
    const { checkInDate, checkOutDate } = req.query as {
      checkInDate: string;
      checkOutDate: string;
    };

    if (!checkInDate || !checkOutDate) {
       res
        .status(400)
        .json({ message: "Missing check-in or check-out date" });
        return
    }

    const rooms = await getAvailableRoomsOnDatesService(
      checkInDate,
      checkOutDate
    );
    res.status(200).json({ success: true, data: rooms });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch available rooms",
      error: error.message,
    });
  }
};

