import {
  TBookingSelect,
  TCustomerSupportTicketSelect,
  TPaymentSelect,
  TRoomSelect,
} from "../drizzle/schema";

export interface UserAnalytics {
  userId: number;
  openTicketsCount: number;
  totalAmountPaid: number;
  pendingAmount: number;
  recentBookings: TBookingSelect[];
  paymentsByMonth: { month: string; amount: number }[];
  suggestedRoom: TRoomSelect | null;
}

export interface PaymentByMonth {
  month: string;
  amount: number;
}