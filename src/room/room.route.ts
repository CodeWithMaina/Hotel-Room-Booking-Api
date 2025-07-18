import { Router } from "express";
import { 
  createRoomController, 
  deleteRoomController, 
  getRoomByHotelIdController, 
  getRoomByIdController, 
  getRoomsController, 
  getRoomWithAmenitiesController, 
  updateRoomController 
} from "./room.controller";

export const roomRouter = Router();

roomRouter.get('/rooms', getRoomsController);
roomRouter.get("/room/:id", getRoomByIdController);
roomRouter.post("/room", createRoomController);
roomRouter.put("/room/:id", updateRoomController);
roomRouter.put("/available/rooms/:id", updateRoomController);
roomRouter.delete("/room/:id", deleteRoomController);
roomRouter.get("/hotel/:id/rooms", getRoomByHotelIdController);
roomRouter.get("/room/:id/room-details", getRoomWithAmenitiesController);