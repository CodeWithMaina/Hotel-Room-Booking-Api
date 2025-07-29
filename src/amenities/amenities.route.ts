import { Router } from "express";
import { 
  createAmenityController, 
  deleteAmenityController, 
  getAmenityByIdController, 
  getAmenitiesController, 
  updateAmenityController 
} from "./amenities.controller";
import { adminOnly, authenticated } from "../middleware/bearAuth";

export const amenityRouter = Router();

amenityRouter.get('/amenities', authenticated, getAmenitiesController);
amenityRouter.get("/amenity/:id", getAmenityByIdController);
amenityRouter.post("/amenity",authenticated, adminOnly, createAmenityController);
amenityRouter.put("/amenity/:id",authenticated, adminOnly, updateAmenityController);
amenityRouter.delete("/amenity/:id",authenticated, adminOnly, deleteAmenityController);