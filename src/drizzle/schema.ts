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
export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);
export const bookingStatusEnum = pgEnum('booking_status', ['Pending', 'Confirmed', 'Cancelled']);
export const paymentStatusEnum = pgEnum('payment_status', ['Pending', 'Completed', 'Failed']);
export const ticketStatusEnum = pgEnum('ticket_status', ['Open', 'Resolved']);

// ====================== TABLES ======================
export const users = pgTable('users', {
  userId: serial('userId').primaryKey(),
  firstName: varchar('firstName', { length: 100 }).notNull(),
  lastName: varchar('lastName', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  contactPhone: varchar('contactPhone', { length: 20 }),
  address: text('address'),
  role: userRoleEnum('role').default('user'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});

export const hotels = pgTable('hotels', {
  hotelId: serial('hotelId').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  location: varchar('location', { length: 255 }),
  address: text('address').notNull(),
  contactPhone: varchar('contactPhone', { length: 20 }),
  category: varchar('category', { length: 100 }),
  rating: numeric('rating', { precision: 2, scale: 1 }),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});

export const rooms = pgTable('rooms', {
  roomId: serial('roomId').primaryKey(),
  hotelId: integer('hotelId').references(() => hotels.hotelId, { onDelete: 'cascade' }),
  roomType: varchar('roomType', { length: 100 }).notNull(),
  pricePerNight: numeric('pricePerNight', { precision: 10, scale: 2 }).notNull(),
  capacity: integer('capacity').notNull(),
  amenities: text('amenities').array(),
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
}));

export const hotelsRelations = relations(hotels, ({ many }) => ({
  rooms: many(rooms),
}));

export const roomsRelations = relations(rooms, ({ one, many }) => ({
  hotel: one(hotels, {
    fields: [rooms.hotelId],
    references: [hotels.hotelId],
  }),
  bookings: many(bookings),
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