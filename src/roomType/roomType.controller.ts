import z from "zod";
import { TRoomTypeInsert } from "../drizzle/schema";
import { createRoomType, deleteRoomType, getRoomTypeById, getRoomTypes, updateRoomType } from "./roomType.service";
import { Request, Response } from "express";
import { roomTypeSchema, updateRoomTypeSchema } from "./roomtypes.schema";




export const createRoomTypeController = async (req: Request, res: Response) => {
  try {
    const result = roomTypeSchema.safeParse(req.body);
    if (!result.success) {
       res.status(400).json({ message: 'Invalid input', errors: result.error.errors });
       return
    }

    const roomType = await createRoomType(result.data as TRoomTypeInsert);
     res.status(201).json(roomType);
     return;
  } catch (error) {
    console.error('Error creating room type:', error);
     res.status(500).json({ message: 'Internal Server Error' });
     return
  }
};

export const getRoomTypesController = async (_req: Request, res: Response)=> {
  try {
    const types = await getRoomTypes();
     res.status(200).json(types);
     return;
  } catch (error) {
    console.error('Error fetching room types:', error);
     res.status(500).json({ message: 'Internal Server Error' });
     return
  }
};

export const getRoomTypeByIdController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
       res.status(400).json({ message: 'Invalid room type ID' });
       return
    }

    const type = await getRoomTypeById(id);
    if (!type) {
       res.status(404).json({ message: 'Room type not found' });
       return
    }

     res.status(200).json(type);
     return
  } catch (error) {
    console.error('Error retrieving room type:', error);
     res.status(500).json({ message: 'Internal Server Error' });
     return
  }
};

export const updateRoomTypeController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid room type ID' });
      return;
    }

    const result = updateRoomTypeSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: 'Invalid input', errors: result.error.errors });
      return;
    }

    const updatedRoomType = await updateRoomType(id, result.data);
    if (!updatedRoomType || updatedRoomType.length === 0) {
      res.status(404).json({ message: 'Room type not found' });
      return;
    }

    res.status(200).json(updatedRoomType[0]);
  } catch (error) {
    console.error('Error updating room type:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const deleteRoomTypeController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid room type ID' });
      return;
    }

    const deletedRoomType = await deleteRoomType(id);
    if (!deletedRoomType || deletedRoomType.length === 0) {
      res.status(404).json({ message: 'Room type not found' });
      return;
    }

    res.status(200).json({ message: 'Room type deleted successfully' });
  } catch (error) {
    console.error('Error deleting room type:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};