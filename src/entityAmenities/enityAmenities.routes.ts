import { Router } from "express";
import { 
  createEntityAmenityController, 
  deleteEntityAmenityController, 
  getEntityAmenityByIdController, 
  getEntityAmenitiesController, 
  updateEntityAmenityController 
} from "./enityAmenities.controller";

export const entityAmenityRouter = Router();

entityAmenityRouter.get('/entity-amenities', getEntityAmenitiesController);
entityAmenityRouter.get("/entity-amenity/:id", getEntityAmenityByIdController);
entityAmenityRouter.post("/entity-amenity", createEntityAmenityController);
entityAmenityRouter.put("/entity-amenity/:id", updateEntityAmenityController);
entityAmenityRouter.delete("/entity-amenity/:id", deleteEntityAmenityController);