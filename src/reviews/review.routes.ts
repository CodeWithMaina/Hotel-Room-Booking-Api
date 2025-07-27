import { Router } from 'express';
import { createReviewController, deleteReviewController, getAllReviewsController, getReviewByIdController, getReviewsByRoomTypeController, updateReviewController } from './review.controller';

export const reviewRouter = Router();

reviewRouter.post('/review', createReviewController);
reviewRouter.get('/reviews', getAllReviewsController);
reviewRouter.get('/review/:id', getReviewByIdController);
reviewRouter.put('/review/:id', updateReviewController);
reviewRouter.delete('/review/:id', deleteReviewController);
reviewRouter.get('/reviews/room-type/:roomTypeId', getReviewsByRoomTypeController);
