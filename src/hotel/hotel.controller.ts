import { Request, Response } from "express";
import {
  getHotelsService,
  getHotelByIdService,
  createHotelService,
  updateHotelService,
  deleteHotelService,
} from "./hotel.service";
import { THotelInsert, THotelSelect } from "../drizzle/schema";

export const getHotelsController = async (req: Request, res: Response) => {
  try {
    const hotels = await getHotelsService();
    if (hotels == null || hotels.length === 0) {
      res.status(404).json({ message: "No hotels found" });
      return;
    }
    res.status(200).json({"Hotels": hotels});
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch hotels",
      error: error.message,
    });
  }
};

export const getHotelByIdController = async (req: Request, res: Response) => {
  try {
    const hotelId = parseInt(req.params.id);
    if (isNaN(hotelId)) {
      res.status(400).json({ message: "Invalid hotel ID" });
      return;
    }

    const hotel = await getHotelByIdService(hotelId);
    if (!hotel) {
      res.status(404).json({ message: "Hotel not found" });
      return;
    }
    res.status(200).json(hotel);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch hotel",
      error: error.message,
    });
  }
};

export const createHotelController = async (req: Request, res: Response) => {
  try {
    const hotelData: THotelInsert = req.body;
    if (!hotelData.name || !hotelData.address) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const newHotel = await createHotelService(hotelData);
    res.status(201).json(newHotel);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to create hotel",
      error: error.message,
    });
  }
};

export const updateHotelController = async (req: Request, res: Response) => {
  try {
    const hotelId = parseInt(req.params.id);
    if (isNaN(hotelId)) {
      res.status(400).json({ message: "Invalid hotel ID" });
      return;
    }

    const hotelData: Partial<THotelInsert> = req.body;
    if (Object.keys(hotelData).length === 0) {
      res.status(400).json({ message: "No data provided for update" });
      return;
    }

    const updatedHotel = await updateHotelService(hotelId, hotelData);
    if (!updatedHotel) {
      res.status(404).json({ message: "Hotel not found" });
      return;
    }
    res.status(200).json(updatedHotel);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to update hotel",
      error: error.message,
    });
  }
};

export const deleteHotelController = async (req: Request, res: Response) => {
  try {
    const hotelId = parseInt(req.params.id);
    if (isNaN(hotelId)) {
      res.status(400).json({ message: "Invalid hotel ID" });
      return;
    }

    const deletedHotel = await deleteHotelService(hotelId);
    if (!deletedHotel) {
      res.status(404).json({ message: "Hotel not found" });
      return;
    }
    res.status(200).json({ message: "Hotel deleted successfully" });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to delete hotel",
      error: error.message,
    });
  }
};