import { Request, Response } from "express";
import {
  getEntityAmenitiesService,
  getEntityAmenityByIdService,
  createEntityAmenityService,
  updateEntityAmenityService,
  deleteEntityAmenityService,
} from "./enityAmenities.service";
import { TEntityAmenityInsert, TEntityAmenitySelect } from "../drizzle/schema";

export const getEntityAmenitiesController = async (req: Request, res: Response) => {
  try {
    const entityAmenities = await getEntityAmenitiesService();
    if (entityAmenities == null || entityAmenities.length === 0) {
      res.status(404).json({ message: "No entity amenities found" });
      return;
    }
    res.status(200).json({"EntityAmenities": entityAmenities});
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch entity amenities",
      error: error.message,
    });
  }
};

export const getEntityAmenityByIdController = async (req: Request, res: Response) => {
  try {
    const entityAmenityId = parseInt(req.params.id);
    if (isNaN(entityAmenityId)) {
      res.status(400).json({ message: "Invalid entity amenity ID" });
      return;
    }

    const entityAmenity = await getEntityAmenityByIdService(entityAmenityId);
    if (!entityAmenity) {
      res.status(404).json({ message: "Entity amenity not found" });
      return;
    }
    res.status(200).json(entityAmenity);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch entity amenity",
      error: error.message,
    });
  }
};

export const createEntityAmenityController = async (req: Request, res: Response) => {
  try {
    const entityAmenityData: TEntityAmenityInsert = req.body;
    if (!entityAmenityData.amenityId || !entityAmenityData.entityId || !entityAmenityData.entityType) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const newEntityAmenity = await createEntityAmenityService(entityAmenityData);
    res.status(201).json(newEntityAmenity);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to create entity amenity",
      error: error.message,
    });
  }
};

export const updateEntityAmenityController = async (req: Request, res: Response) => {
  try {
    const entityAmenityId = parseInt(req.params.id);
    if (isNaN(entityAmenityId)) {
      res.status(400).json({ message: "Invalid entity amenity ID" });
      return;
    }

    const entityAmenityData: Partial<TEntityAmenityInsert> = req.body;
    if (Object.keys(entityAmenityData).length === 0) {
      res.status(400).json({ message: "No data provided for update" });
      return;
    }

    const updatedEntityAmenity = await updateEntityAmenityService(entityAmenityId, entityAmenityData);
    if (!updatedEntityAmenity) {
      res.status(404).json({ message: "Entity amenity not found" });
      return;
    }
    res.status(200).json(updatedEntityAmenity);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to update entity amenity",
      error: error.message,
    });
  }
};

export const deleteEntityAmenityController = async (req: Request, res: Response) => {
  try {
    const entityAmenityId = parseInt(req.params.id);
    if (isNaN(entityAmenityId)) {
      res.status(400).json({ message: "Invalid entity amenity ID" });
      return;
    }

    const deletedEntityAmenity = await deleteEntityAmenityService(entityAmenityId);
    if (!deletedEntityAmenity) {
      res.status(404).json({ message: "Entity amenity not found" });
      return;
    }
    res.status(200).json({ message: "Entity amenity deleted successfully" });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to delete entity amenity",
      error: error.message,
    });
  }
};