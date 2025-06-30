import db from "../drizzle/db";
import { eq } from "drizzle-orm";
import { customerSupportTickets } from "../drizzle/schema";
import { TCustomerSupportTicketInsert, TCustomerSupportTicketSelect } from "../drizzle/schema";

export const getTicketsService = async (): Promise<TCustomerSupportTicketSelect[]> => {
    return await db.query.customerSupportTickets.findMany();
};

export const getTicketByIdService = async (ticketId: number): Promise<TCustomerSupportTicketSelect | null> => {
    const result = await db.query.customerSupportTickets.findFirst({
        where: eq(customerSupportTickets.ticketId, ticketId)
    });
    return result || null;
};

export const createTicketService = async (ticketData: TCustomerSupportTicketInsert): Promise<TCustomerSupportTicketSelect> => {
    const result = await db.insert(customerSupportTickets).values(ticketData).returning();
    return result[0];
};

export const updateTicketService = async (
    ticketId: number, 
    ticketData: Partial<TCustomerSupportTicketInsert>
): Promise<TCustomerSupportTicketSelect | null> => {
    const result = await db.update(customerSupportTickets)
        .set(ticketData)
        .where(eq(customerSupportTickets.ticketId, ticketId))
        .returning();
    
    return result[0] || null;
};

export const deleteTicketService = async (ticketId: number): Promise<TCustomerSupportTicketSelect | null> => {
    const result = await db.delete(customerSupportTickets)
        .where(eq(customerSupportTickets.ticketId, ticketId))
        .returning();
    
    return result[0] || null;
};