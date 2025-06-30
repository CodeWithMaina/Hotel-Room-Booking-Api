import { Router } from "express";
import { 
  createRoomController, 
  deleteRoomController, 
  getRoomByIdController, 
  getRoomsController, 
  updateRoomController 
} from "./room.controller";

export const roomRouter = Router();

roomRouter.get('/rooms', getRoomsController);
roomRouter.get("/room/:id", getRoomByIdController);
roomRouter.post("/room", createRoomController);
roomRouter.put("/room/:id", updateRoomController);
roomRouter.delete("/room/:id", deleteRoomController);