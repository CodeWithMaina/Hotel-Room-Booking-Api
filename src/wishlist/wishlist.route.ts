import { Router } from "express";
import {
  addToWishlistController,
  getWishlistItemsByUserIdController,
  removeFromWishlistController,
  checkInWishlistController,
  updateWishlistItemController,
} from "./wishlist.controller";

export const wishlistRouter = Router();

// Get all wishlist items for a user
wishlistRouter.get("/wishlist/:id", getWishlistItemsByUserIdController);

// Add item to wishlist
wishlistRouter.post("/wishlist/", addToWishlistController);

// Update wishlist item
wishlistRouter.patch("/wishlist/:id", updateWishlistItemController);

// Remove item from wishlist
wishlistRouter.delete("/wishlist/:id", removeFromWishlistController);

// Check if item exists in wishlist
wishlistRouter.get("/wishlist/check", checkInWishlistController);