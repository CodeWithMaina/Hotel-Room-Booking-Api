import { Router } from "express";
import { 
  createHotelController, 
  deleteHotelController, 
  getHotelByIdController, 
  getHotelsController, 
  updateHotelController 
} from "./hotel.controller";

export const hotelRouter = Router();

hotelRouter.get('/hotels', getHotelsController);
hotelRouter.get("/hotel/:id", getHotelByIdController);
hotelRouter.post("/hotel", createHotelController);
hotelRouter.put("/hotel/:id", updateHotelController);
hotelRouter.delete("/hotel/:id", deleteHotelController);