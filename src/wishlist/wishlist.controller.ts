import { Request, Response } from "express";
import {
  checkInWishlistService,
  createWishlistItemService,
  deleteWishlistItemService,
  getWishlistItemsByUserIdService,
  updateWishlistItemService,
} from "./wishlist.service";
import { TWishlistInsert } from "../drizzle/schema";

export const getWishlistItemsByUserIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
       res.status(400).json({ message: "Invalid user ID" });
       return
    }

    const wishlistItems = await getWishlistItemsByUserIdService(userId);
    res.status(200).json(wishlistItems);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch wishlist",
      error: error.message,
    });
  }
};

export const addToWishlistController = async (req: Request, res: Response) => {
  try {
    const wishlistData: TWishlistInsert = req.body;
    if (!wishlistData.userId || !wishlistData.roomId) {
       res.status(400).json({ message: "Missing required fields" });
       return;
    }

    const newWishlistItem = await createWishlistItemService(wishlistData);
    res.status(201).json(newWishlistItem);
  } catch (error: any) {
    if (error.message === "Room already exists in wishlist") {
      res.status(409).json({ message: error.message });
    } else {
      res.status(500).json({
        message: "Failed to add to wishlist",
        error: error.message,
      });
    }
  }
};

export const updateWishlistItemController = async (
  req: Request,
  res: Response
) => {
  try {
    const wishlistId = parseInt(req.params.id);
    if (isNaN(wishlistId)) {
       res.status(400).json({ message: "Invalid wishlist ID" });
       return;
    }

    const updateData: Partial<TWishlistInsert> = req.body;
    const updatedItem = await updateWishlistItemService(wishlistId, updateData);
    res.status(200).json(updatedItem);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to update wishlist item",
      error: error.message,
    });
  }
};

export const removeFromWishlistController = async (
  req: Request,
  res: Response
) => {
  try {
    const wishlistId = parseInt(req.params.id);
    if (isNaN(wishlistId)) {
       res.status(400).json({ message: "Invalid wishlist ID" });
       return;
    }

    await deleteWishlistItemService(wishlistId);
    res.status(200).json({ message: "Wishlist item removed successfully" });
  } catch (error: any) {
    if (error.message === "Wishlist item not found") {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({
        message: "Failed to remove from wishlist",
        error: error.message,
      });
    }
  }
};

export const checkInWishlistController = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.query.userId as string);
    const roomId = parseInt(req.query.roomId as string);

    if (isNaN(userId) || isNaN(roomId)) {
       res.status(400).json({ message: "Invalid user ID or room ID" });
       return;
    }

    const exists = await checkInWishlistService(userId, roomId);
    res.status(200).json({ exists });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to check wishlist status",
      error: error.message,
    });
  }
};