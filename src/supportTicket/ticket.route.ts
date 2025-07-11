import { Router } from "express";
import { 
  createTicketController, 
  deleteTicketController, 
  getTicketByIdController, 
  getTicketsController, 
  getUserTicketsController, 
  updateTicketController 
} from "./ticket.controller";

export const ticketRouter = Router();

ticketRouter.get('/tickets', getTicketsController);
ticketRouter.get("/ticket/:id", getTicketByIdController);
ticketRouter.post("/ticket", createTicketController);
ticketRouter.put("/ticket/:id", updateTicketController);
ticketRouter.delete("/ticket/:id", deleteTicketController);
ticketRouter.get('/:userId/tickets', getUserTicketsController);