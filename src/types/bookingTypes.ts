export type TBookingInsertForm = {
  userId: number;
  roomId: number;
  checkInDate: string;    
  checkOutDate: string; 
  totalAmount: string; 
  bookingStatus: 'Pending' | 'Confirmed' | 'Cancelled'; 
};