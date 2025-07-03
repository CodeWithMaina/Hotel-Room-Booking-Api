import { Request, Response } from "express";
import {
  getAmenitiesService,
  getAmenityByIdService,
  createAmenityService,
  updateAmenityService,
  deleteAmenityService,
} from "./amenities.service";
import { TAmenityInsert, TAmenitySelect } from "../drizzle/schema";

export const getAmenitiesController = async (req: Request, res: Response) => {
  try {
    const amenities = await getAmenitiesService();
    if (amenities == null || amenities.length === 0) {
      res.status(404).json({ message: "No amenities found" });
      return;
    }
    res.status(200).json({"Amenities": amenities});
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch amenities",
      error: error.message,
    });
  }
};

export const getAmenityByIdController = async (req: Request, res: Response) => {
  try {
    const amenityId = parseInt(req.params.id);
    if (isNaN(amenityId)) {
      res.status(400).json({ message: "Invalid amenity ID" });
      return;
    }

    const amenity = await getAmenityByIdService(amenityId);
    if (!amenity) {
      res.status(404).json({ message: "Amenity not found" });
      return;
    }
    res.status(200).json(amenity);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch amenity",
      error: error.message,
    });
  }
};

export const createAmenityController = async (req: Request, res: Response) => {
  try {
    const amenityData: TAmenityInsert = req.body;
    if (!amenityData.name) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const newAmenity = await createAmenityService(amenityData);
    res.status(201).json(newAmenity);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to create amenity",
      error: error.message,
    });
  }
};

export const updateAmenityController = async (req: Request, res: Response) => {
  try {
    const amenityId = parseInt(req.params.id);
    if (isNaN(amenityId)) {
      res.status(400).json({ message: "Invalid amenity ID" });
      return;
    }

    const amenityData: Partial<TAmenityInsert> = req.body;
    if (Object.keys(amenityData).length === 0) {
      res.status(400).json({ message: "No data provided for update" });
      return;
    }

    const updatedAmenity = await updateAmenityService(amenityId, amenityData);
    if (!updatedAmenity) {
      res.status(404).json({ message: "Amenity not found" });
      return;
    }
    res.status(200).json(updatedAmenity);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to update amenity",
      error: error.message,
    });
  }
};

export const deleteAmenityController = async (req: Request, res: Response) => {
  try {
    const amenityId = parseInt(req.params.id);
    if (isNaN(amenityId)) {
      res.status(400).json({ message: "Invalid amenity ID" });
      return;
    }

    const deletedAmenity = await deleteAmenityService(amenityId);
    if (!deletedAmenity) {
      res.status(404).json({ message: "Amenity not found" });
      return;
    }
    res.status(200).json({ message: "Amenity deleted successfully" });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to delete amenity",
      error: error.message,
    });
  }
};