import { createReview, deleteReview, getAllReviews, getReviewById, getReviewsByRoomType, updateReview } from './review.service';
import { reviewSchema, reviewUpdateSchema } from './review.schema';
import { Request, Response } from 'express';

export const createReviewController = async (req: Request, res: Response) => {
  try {
    const result = reviewSchema.safeParse(req.body);

    if (!result.success) {
       res.status(400).json({ message: "Invalid input", errors: result.error.errors });
       return;
    }

    const review = await createReview(result.data);
     res.status(201).json(review);
     return;
  } catch (error) {
    console.error("Error creating review:", error);
     res.status(500).json({ message: "Internal Server Error" });
     return;
  }
};

export const getAllReviewsController = async (req: Request, res: Response) => {
  try {
    const reviews = await getAllReviews();
     res.status(200).json(reviews);
     return;
  } catch (error) {
    console.error("Error fetching reviews:", error);
     res.status(500).json({ message: "Internal Server Error" });
     return;
  }
};


export const getReviewByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
       res.status(400).json({ message: "Invalid review ID" });
       return;
    }

    const review = await getReviewById(id);

    if (!review) {
       res.status(404).json({ message: "Review not found" });
       return;
    }

     res.status(200).json(review);
     return;
  } catch (error) {
    console.error("Error retrieving review:", error);
     res.status(500).json({ message: "Internal Server Error" });
     return;
  }
};

export const updateReviewController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid review ID" });
      return;
    }

    const result = reviewUpdateSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({ message: "Invalid input", errors: result.error.errors });
      return;
    }

    const updatedReview = await updateReview(id, result.data);
    
    if (!updatedReview || updatedReview.length === 0) {
      res.status(404).json({ message: "Review not found" });
      return;
    }

    res.status(200).json(updatedReview[0]);
    return;
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }
};

export const deleteReviewController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid review ID" });
      return;
    }

    const deletedReview = await deleteReview(id);
    
    if (!deletedReview || deletedReview.length === 0) {
      res.status(404).json({ message: "Review not found" });
      return;
    }

    res.status(200).json({ message: "Review deleted successfully" });
    return;
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }
};

export const getReviewsByRoomTypeController = async (req: Request, res: Response) => {
  try {
    const roomTypeId = parseInt(req.params.roomTypeId, 10);
    
    if (isNaN(roomTypeId)) {
      res.status(400).json({ message: "Invalid room type ID" });
      return;
    }

    const reviews = await getReviewsByRoomType(roomTypeId);
    res.status(200).json(reviews);
    return;
  } catch (error) {
    console.error("Error fetching reviews by room type:", error);
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }
};