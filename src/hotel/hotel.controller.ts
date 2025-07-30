import { Request, Response } from "express";
import {
  getHotelsService,
  getHotelByIdService,
  createHotelService,
  updateHotelService,
  deleteHotelService,
  getHotelAmenitiesDetailsService,
  getHotelEntityAmenitiesService,
  getHotelAddressService,
  getHotelFullDetailsService,
} from "./hotel.service";
import { THotelInsert, THotelSelect } from "../drizzle/schema";

export const getHotelsController = async (req: Request, res: Response) => {
  try {
    const hotels = await getHotelsService();
    if (hotels == null || hotels.length === 0) {
      res.status(404).json({ message: "No hotels found" });
      return;
    }
    res.status(200).json(hotels);
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
     return;
  } catch (error: any) {
    console.error('Controller error:', error);
     res.status(500).json({
      message: "Failed to fetch hotel",
      error: error.message,
    });
    return;
  }
};

export const createHotelController = async (req: Request, res: Response) => {
  try {
    const hotelData: THotelInsert = req.body;
    if (!hotelData.name) {
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



export const getHotelAddressController = async (req: Request, res: Response) => {
  try {
    const hotelId = parseInt(req.params.hotelId);
    if (isNaN(hotelId)) {
       res.status(400).json({ message: "Invalid hotel ID" });
       return;
    }

    const address = await getHotelAddressService(hotelId);
    if (!address) {
       res.status(404).json({ message: "Address not found for this hotel" });
       return;
    }
    res.status(200).json(address);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch hotel address",
      error: error.message,
    });
  }
};

export const getHotelEntityAmenitiesController = async (req: Request, res: Response) => {
  try {
    const hotelId = parseInt(req.params.hotelId);
    if (isNaN(hotelId)) {
       res.status(400).json({ message: "Invalid hotel ID" });
       return;
    }

    const entityAmenities = await getHotelEntityAmenitiesService(hotelId);
    res.status(200).json(entityAmenities);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch hotel entity amenities",
      error: error.message,
    });
  }
};

export const getHotelAmenitiesDetailsController = async (req: Request, res: Response) => {
  try {
    const hotelId = parseInt(req.params.hotelId);
    if (isNaN(hotelId)) {
       res.status(400).json({ message: "Invalid hotel ID" });
       return;
    }

    const amenities = await getHotelAmenitiesDetailsService(hotelId);
    res.status(200).json(amenities);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch hotel amenities details",
      error: error.message,
    });
  }
};


export const getHotelFullDetailsController = async (req: Request, res: Response) => {
  try {
    const hotelId = parseInt(req.params.hotelId);
    if (isNaN(hotelId)) {
       res.status(400).json({ 
        success: false,
        message: "Invalid hotel ID" 
      });
      return;
    }

    const result = await getHotelFullDetailsService(hotelId);
    
    if (!result.success) {
       res.status(404).json(result);
       return;
    }

     res.status(200).json(result);
     return;
  } catch (error: any) {
    console.error('Controller error:', error);
     res.status(500).json({
      success: false,
      message: "Failed to fetch hotel details",
      error: error.message,
    });
    return;
  }
};