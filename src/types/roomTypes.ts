import { TRoomSelect } from "../drizzle/schema";


export type TRoomAmenity = {
  amenityId: number;
  name: string;
  description?: string | null;
  icon?: string | null;
  createdAt: Date;
  
};

export type TRoomEntityAmenity = {
  id: number;
  amenityId: number;
  entityId: number;
  entityType: 'room';
  createdAt: Date;
  
};

export type TRoomWithAmenities = {
  room: TRoomSelect;
  amenities: TRoomAmenity[];
  // entityAmenities: TRoomEntityAmenity[];
};