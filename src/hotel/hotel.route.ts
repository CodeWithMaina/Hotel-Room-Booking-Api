import { Router } from "express";
import { 
  createHotelController, 
  deleteHotelController, 
  getHotelAddressController, 
  getHotelAmenitiesDetailsController, 
  getHotelByIdController, 
  getHotelEntityAmenitiesController, 
  getHotelFullDetailsController, 
  getHotelsController, 
  updateHotelController 
} from "./hotel.controller";

export const hotelRouter = Router();

hotelRouter.get('/hotels', getHotelsController);
hotelRouter.get("/hotel/:id", getHotelByIdController);
hotelRouter.post("/hotel", createHotelController);
hotelRouter.put("/hotel/:id", updateHotelController);
hotelRouter.delete("/hotel/:id", deleteHotelController);


// Get address by hotel ID
hotelRouter.get("/hotel/:hotelId/address", getHotelAddressController);

// Find all entity amenities for one hotel
hotelRouter.get("/hotel/:hotelId/entity-amenities", getHotelEntityAmenitiesController);

// Get full amenity details for each entity amenity
hotelRouter.get("/hotel/:hotelId/amenities", getHotelAmenitiesDetailsController);

hotelRouter.get("/hotel/:hotelId/details", getHotelFullDetailsController);