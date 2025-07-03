import { 
  pgTable, 
  serial, 
  varchar, 
  text, 
  timestamp, 
  boolean, 
  integer, 
  numeric, 
  date, 
  pgEnum,
  primaryKey,
  foreignKey
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ====================== ENUMS ======================
export const userRoleEnum = pgEnum('userRole', ['user','owner', 'admin']);
export const bookingStatusEnum = pgEnum('bookingStatus', ['Pending', 'Confirmed', 'Cancelled']);
export const paymentStatusEnum = pgEnum('paymentStatus', ['Pending', 'Completed', 'Failed']);
export const ticketStatusEnum = pgEnum('ticketStatus', ['Open', 'Resolved']);
export const addressEntityTypeEnum = pgEnum('addressEntityType', ['user', 'hotel']);
export const amenityEntityTypeEnum = pgEnum('amenityEntityType', ['room', 'hotel']);

// ====================== TABLES ======================
export const users = pgTable('users', {
  userId: serial('userId').primaryKey(),
  firstName: varchar('firstName', { length: 100 }).notNull(),
  lastName: varchar('lastName', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  contactPhone: varchar('contactPhone', { length: 20 }),
  // Removed address field since we'll use the address table
  role: userRoleEnum('role').default('user'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});

export const hotels = pgTable('hotels', {
  hotelId: serial('hotelId').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  location: varchar('location', { length: 255 }),
  // Removed address field since we'll use the address table
  contactPhone: varchar('contactPhone', { length: 20 }),
  category: varchar('category', { length: 100 }),
  rating: numeric('rating', { precision: 2, scale: 1 }),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});

export const addresses = pgTable('addresses', {
  addressId: serial('addressId').primaryKey(),
  entityId: integer('entityId').notNull(), // Can be userId or hotelId
  entityType: addressEntityTypeEnum('entityType').notNull(), // 'user' or 'hotel'
  street: varchar('street', { length: 255 }).notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }),
  postalCode: varchar('postalCode', { length: 20 }).notNull(),
  country: varchar('country', { length: 100 }).notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});

export const amenities = pgTable('amenities', {
  amenityId: serial('amenityId').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  icon: varchar('icon', { length: 50 }), // Optional icon name for UI
  createdAt: timestamp('createdAt').defaultNow(),
});

export const entityAmenities = pgTable('entityAmenities', {
  id: serial('id').primaryKey(),
  amenityId: integer('amenityId').references(() => amenities.amenityId, { onDelete: 'cascade' }),
  entityId: integer('entityId').notNull(), // Can be roomId or hotelId
  entityType: amenityEntityTypeEnum('entityType').notNull(), // 'room' or 'hotel'
  createdAt: timestamp('createdAt').defaultNow(),
});

export const rooms = pgTable('rooms', {
  roomId: serial('roomId').primaryKey(),
  hotelId: integer('hotelId').references(() => hotels.hotelId, { onDelete: 'cascade' }),
  roomType: varchar('roomType', { length: 100 }).notNull(),
  pricePerNight: numeric('pricePerNight', { precision: 10, scale: 2 }).notNull(),
  capacity: integer('capacity').notNull(),
  // Removed amenities array since we'll use the entityAmenities table
  isAvailable: boolean('isAvailable').default(true),
  createdAt: timestamp('createdAt').defaultNow(),
});

export const bookings = pgTable('bookings', {
  bookingId: serial('bookingId').primaryKey(),
  userId: integer('userId').references(() => users.userId, { onDelete: 'cascade' }),
  roomId: integer('roomId').references(() => rooms.roomId, { onDelete: 'cascade' }),
  checkInDate: date('checkInDate').notNull(),
  checkOutDate: date('checkOutDate').notNull(),
  totalAmount: numeric('totalAmount', { precision: 10, scale: 2 }).notNull(),
  bookingStatus: bookingStatusEnum('bookingStatus').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});

export const payments = pgTable('payments', {
  paymentId: serial('paymentId').primaryKey(),
  bookingId: integer('bookingId').references(() => bookings.bookingId, { onDelete: 'cascade' }),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  paymentStatus: paymentStatusEnum('paymentStatus').notNull(),
  paymentDate: timestamp('paymentDate'),
  paymentMethod: varchar('paymentMethod', { length: 50 }),
  transactionId: varchar('transactionId', { length: 255 }),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});

export const customerSupportTickets = pgTable('customerSupportTickets', {
  ticketId: serial('ticketId').primaryKey(),
  userId: integer('userId').references(() => users.userId, { onDelete: 'cascade' }),
  subject: varchar('subject', { length: 255 }).notNull(),
  description: text('description').notNull(),
  status: ticketStatusEnum('status').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});

// ====================== RELATIONS ======================
export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  tickets: many(customerSupportTickets),
  addresses: many(addresses, {
    relationName: 'userAddresses',
  }),
}));

export const hotelsRelations = relations(hotels, ({ many }) => ({
  rooms: many(rooms),
  addresses: many(addresses, {
    relationName: 'hotelAddresses',
  }),
  amenities: many(entityAmenities, {
    relationName: 'hotelAmenities',
  }),
}));

export const roomsRelations = relations(rooms, ({ one, many }) => ({
  hotel: one(hotels, {
    fields: [rooms.hotelId],
    references: [hotels.hotelId],
  }),
  bookings: many(bookings),
  amenities: many(entityAmenities, {
    relationName: 'roomAmenities',
  }),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, {
    fields: [addresses.entityId],
    references: [users.userId],
    relationName: 'userAddresses',
  }),
  hotel: one(hotels, {
    fields: [addresses.entityId],
    references: [hotels.hotelId],
    relationName: 'hotelAddresses',
  }),
}));

export const amenitiesRelations = relations(amenities, ({ many }) => ({
  entities: many(entityAmenities),
}));

export const entityAmenitiesRelations = relations(entityAmenities, ({ one }) => ({
  amenity: one(amenities, {
    fields: [entityAmenities.amenityId],
    references: [amenities.amenityId],
  }),
  room: one(rooms, {
    fields: [entityAmenities.entityId],
    references: [rooms.roomId],
    relationName: 'roomAmenities',
  }),
  hotel: one(hotels, {
    fields: [entityAmenities.entityId],
    references: [hotels.hotelId],
    relationName: 'hotelAmenities',
  }),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.userId],
  }),
  room: one(rooms, {
    fields: [bookings.roomId],
    references: [rooms.roomId],
  }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, {
    fields: [payments.bookingId],
    references: [bookings.bookingId],
  }),
}));

export const customerSupportTicketsRelations = relations(customerSupportTickets, ({ one }) => ({
  user: one(users, {
    fields: [customerSupportTickets.userId],
    references: [users.userId],
  }),
}));

// ====================== TYPE INFERENCE ======================
export type TUserSelect = typeof users.$inferSelect;
export type TUserInsert = typeof users.$inferInsert;

export type THotelSelect = typeof hotels.$inferSelect;
export type THotelInsert = typeof hotels.$inferInsert;

export type TRoomSelect = typeof rooms.$inferSelect;
export type TRoomInsert = typeof rooms.$inferInsert;

export type TBookingSelect = typeof bookings.$inferSelect;
export type TBookingInsert = typeof bookings.$inferInsert;

export type TPaymentSelect = typeof payments.$inferSelect;
export type TPaymentInsert = typeof payments.$inferInsert;

export type TCustomerSupportTicketSelect = typeof customerSupportTickets.$inferSelect;
export type TCustomerSupportTicketInsert = typeof customerSupportTickets.$inferInsert;

export type TAddressSelect = typeof addresses.$inferSelect;
export type TAddressInsert = typeof addresses.$inferInsert;

export type TAmenitySelect = typeof amenities.$inferSelect;
export type TAmenityInsert = typeof amenities.$inferInsert;

export type TEntityAmenitySelect = typeof entityAmenities.$inferSelect;
export type TEntityAmenityInsert = typeof entityAmenities.$inferInsert;