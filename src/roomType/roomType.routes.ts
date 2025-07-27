import { Router } from 'express';
import { createRoomTypeController, deleteRoomTypeController, getRoomTypeByIdController, getRoomTypesController, updateRoomTypeController } from './roomType.controller';


export const roomTypeRouter = Router();

roomTypeRouter.post('/room-type', createRoomTypeController);
roomTypeRouter.get('/room-types', getRoomTypesController);
roomTypeRouter.get('/room-types/:id', getRoomTypeByIdController);
roomTypeRouter.put('/room-types/:id', updateRoomTypeController);
roomTypeRouter.delete('/room-types/:id', deleteRoomTypeController);