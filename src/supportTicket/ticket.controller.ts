import { Request, Response } from "express";
import {
  getTicketsService,
  getTicketByIdService,
  createTicketService,
  updateTicketService,
  deleteTicketService,
  getUserTicketsService,
} from "./ticket.service";
import {
  TCustomerSupportTicketInsert,
  TCustomerSupportTicketSelect,
} from "../drizzle/schema";
import { TCreateTicketSchema } from "../validation/ticketSchema";

export const getTicketsController = async (req: Request, res: Response) => {
  try {
    const tickets = await getTicketsService();
    if (tickets == null || tickets.length === 0) {
      res.status(404).json({ message: "No tickets found" });
      return;
    }
    res.status(200).json(tickets);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch tickets",
      error: error.message,
    });
  }
};

export const getTicketByIdController = async (req: Request, res: Response) => {
  try {
    const ticketId = parseInt(req.params.id);
    if (isNaN(ticketId)) {
      res.status(400).json({ message: "Invalid ticket ID" });
      return;
    }

    const ticket = await getTicketByIdService(ticketId);
    if (!ticket) {
      res.status(404).json({ message: "Ticket not found" });
      return;
    }
    res.status(200).json(ticket);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch ticket",
      error: error.message,
    });
  }
};

export const createTicketController = async (req: Request, res: Response) => {
  try {
    const ticketData: TCreateTicketSchema = req.body;
    console.log(ticketData)
    if (!ticketData.userId || !ticketData.subject || !ticketData.description) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const newTicket = await createTicketService(ticketData);
    res.status(201).json(newTicket);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to create ticket",
      error: error.message,
    });
  }
};

export const updateTicketController = async (req: Request, res: Response) => {
  try {
    const ticketId = parseInt(req.params.id);
    if (isNaN(ticketId)) {
      res.status(400).json({ message: "Invalid ticket ID" });
      return;
    }

    const ticketData: Partial<TCustomerSupportTicketInsert> = req.body;
    if (Object.keys(ticketData).length === 0) {
      res.status(400).json({ message: "No data provided for update" });
      return;
    }

    const updatedTicket = await updateTicketService(ticketId, ticketData);
    if (!updatedTicket) {
      res.status(404).json({ message: "Ticket not found" });
      return;
    }
    res.status(200).json(updatedTicket);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to update ticket",
      error: error.message,
    });
  }
};

export const deleteTicketController = async (req: Request, res: Response) => {
  try {
    const ticketId = parseInt(req.params.id);
    if (isNaN(ticketId)) {
      res.status(400).json({ message: "Invalid ticket ID" });
      return;
    }

    const deletedTicket = await deleteTicketService(ticketId);
    if (!deletedTicket) {
      res.status(404).json({ message: "Ticket not found" });
      return;
    }
    res.status(200).json({ message: "Ticket deleted successfully" });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to delete ticket",
      error: error.message,
    });
  }
};

export const getUserTicketsController = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);

    if (isNaN(userId)) {
      res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
      return;
    }

    const tickets: TCustomerSupportTicketSelect[] = await getUserTicketsService(
      userId
    );

    res.status(200).json(tickets);
  } catch (error) {
    console.error("Error fetching user tickets:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
