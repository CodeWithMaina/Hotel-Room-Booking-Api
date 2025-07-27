import { TBookingSelect } from "../drizzle/schema";

export type TUser = {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  contactPhone: string | null;
  address: string | null;
  role: string;
};

export type TRoom = {
  roomId: number;
  roomType: string;
  hotelId: number;
  pricePerNight: string;
  thumbnail: string;
  capacity: number;
  amenities: string[];
  isAvailable: boolean;
};

export type TBookingStatus = "Confirmed" | "Cancelled" | "Pending"; 

export type TBooking = {
  bookingId: number;
  checkInDate: string; // Could also use Date type if you'll parse it
  checkOutDate: string; // Could also use Date type if you'll parse it
  createdAt: Date | null; // Could also use Date type if you'll parse it
  totalAmount: string;
  bookingStatus: TBookingStatus;
  user: TUser;
  room: TRoom;
};

export type TBookingsResponse = TBookingSelect[]

export type TBookingFindParams = {
  columns: {
    bookingId: boolean;
    checkInDate: boolean;
    checkOutDate: boolean;
    createdAt: boolean;
    totalAmount: boolean;
    bookingStatus: boolean;
  };
  with: {
    user: {
      columns: {
        userId: boolean;
        firstName: boolean;
        lastName: boolean;
        email: boolean;
        contactPhone: boolean;
        address: boolean;
        role: boolean;
      };
    };
    room: {
      columns: {
        roomId: boolean;
        roomTypeId: boolean;
        hotelId: boolean;
        pricePerNight: boolean;
        thumbnail: boolean;
        capacity: boolean;
        amenities: boolean;
        isAvailable: boolean;
      };
      with?: {  // Make this optional
        roomType: {
          columns: {
            roomTypeId: boolean;
            name: boolean;
            description: boolean;
            createdAt: boolean;
          };
        };
      };
    };
  };
  where?: any;
};

export type TRoomType = {
    roomTypeId: number;
    name: string;
    description: string;
    createdAt: string;
  };