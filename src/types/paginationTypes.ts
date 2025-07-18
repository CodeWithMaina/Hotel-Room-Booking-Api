import { TBookingStatus } from "./types";

// types/paginationTypes.ts
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export type TBookingsResponse = Array<{
  bookingId: number;
  checkInDate: string;
  checkOutDate: string;
  createdAt: string;
  totalAmount: string;
  bookingStatus: string;
  user: {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    contactPhone: string;
    address: string;
    role: string;
  };
  room: {
    roomId: number;
    roomType: string;
    hotelId: number;
    pricePerNight: string;
    thumbnail: string;
    capacity: number;
    amenities: string;
    isAvailable: boolean;
  };
}>;

export interface BookingStatusFilterParams extends PaginationParams {
  status?: TBookingStatus[];
}