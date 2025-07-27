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
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ====================== ENUMS ======================
export const userRoleEnum = pgEnum("userRole", ["user", "owner", "admin"]);
export const bookingStatusEnum = pgEnum("bookingStatus", [
  "Pending",
  "Confirmed",
  "Cancelled",
]);
export const paymentStatusEnum = pgEnum("paymentStatus", [
  "Pending",
  "Completed",
  "Failed",
]);
export const paymentMethodEnum = pgEnum("paymentMethod", ["card", "mpesa"]);
export const ticketStatusEnum = pgEnum("ticketStatus", ["Open", "Resolved"]);
export const addressEntityTypeEnum = pgEnum("addressEntityType", [
  "user",
  "hotel",
]);
export const amenityEntityTypeEnum = pgEnum("amenityEntityType", [
  "room",
  "hotel",
]);


// ====================== TABLES ======================
export const users = pgTable("users", {
  userId: serial("userId").primaryKey(),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  profileImage: varchar("profileImage"),
  bio: varchar("bio"),
  password: varchar("password", { length: 255 }).notNull(),
  contactPhone: varchar("contactPhone", { length: 20 }),
  role: userRoleEnum("role").default("user"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export const hotels = pgTable("hotels", {
  hotelId: serial("hotelId").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  ownerId: integer("ownerId").references(() => users.userId, {
    onDelete: "cascade",
  }).notNull(),
  location: varchar("location", { length: 255 }),
  thumbnail: varchar("thumbnail"),
  description: text("description"),
  gallery: varchar("gallery", { length: 255 }).array(),
  contactPhone: varchar("contactPhone", { length: 20 }),
  category: varchar("category", { length: 100 }),
  rating: numeric("rating", { precision: 2, scale: 1 }),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export const rooms = pgTable("rooms", {
  roomId: serial("roomId").primaryKey(),
  hotelId: integer("hotelId").references(() => hotels.hotelId, {
    onDelete: "cascade",
  }),
  roomTypeId: integer("roomTypeId").references(() => roomTypes.roomTypeId, {
    onDelete: "set null",
  }),
  pricePerNight: numeric("pricePerNight", {
    precision: 10,
    scale: 2,
  }).notNull(),
  capacity: integer("capacity").notNull(),
  thumbnail: varchar("thumbnail"),
  description: text("description"),
  gallery: varchar("gallery", { length: 255 }).array(),
  isAvailable: boolean("isAvailable").default(true),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const roomTypes = pgTable("roomTypes", {
  roomTypeId: serial("roomTypeId").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const addresses = pgTable("addresses", {
  addressId: serial("addressId").primaryKey(),
  entityId: integer("entityId").notNull(),
  entityType: addressEntityTypeEnum("entityType").notNull(),
  street: varchar("street", { length: 255 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }),
  postalCode: varchar("postalCode", { length: 20 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export const amenities = pgTable("amenities", {
  amenityId: serial("amenityId").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const entityAmenities = pgTable("entityAmenities", {
  id: serial("id").primaryKey(),
  amenityId: integer("amenityId").references(() => amenities.amenityId, {
    onDelete: "cascade",
  }),
  entityId: integer("entityId").notNull(),
  entityType: amenityEntityTypeEnum("entityType").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const bookings = pgTable("bookings", {
  bookingId: serial("bookingId").primaryKey(),
  userId: integer("userId").references(() => users.userId, {
    onDelete: "cascade",
  }),
  roomId: integer("roomId").references(() => rooms.roomId, {
    onDelete: "cascade",
  }),
  checkInDate: date("checkInDate").notNull(),
  checkOutDate: date("checkOutDate").notNull(),
  totalAmount: numeric("totalAmount", { precision: 10, scale: 2 }).notNull(),
  bookingStatus: bookingStatusEnum("bookingStatus").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export const reviews = pgTable("reviews", {
  reviewId: serial("reviewId").primaryKey(),
  userId: integer("userId")
    .references(() => users.userId, { onDelete: "cascade" })
    .notNull(),
  bookingId: integer("bookingId")
    .references(() => bookings.bookingId, { onDelete: "cascade" })
    .notNull(),
  roomId: integer("roomId").references(() => rooms.roomId, {
    onDelete: "set null",
  }),
  hotelId: integer("hotelId").references(() => hotels.hotelId, {
    onDelete: "set null",
  }),
  rating: numeric("rating", { precision: 2, scale: 1 }).notNull(), // e.g. 4.5
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export const wishlist = pgTable("wishlist", {
  wishlistId: serial("wishlistId").primaryKey(),
  userId: integer("userId").references(() => users.userId, {
    onDelete: "cascade",
  }),
  roomId: integer("roomId").references(() => rooms.roomId, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export const payments = pgTable("payments", {
  paymentId: serial("paymentId").primaryKey(),
  bookingId: integer("bookingId").references(() => bookings.bookingId, {
    onDelete: "cascade",
  }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  paymentStatus: paymentStatusEnum("paymentStatus").notNull(),
  paymentDate: timestamp("paymentDate"),
  paymentMethod: paymentMethodEnum("paymentMethod"),
  transactionId: varchar("transactionId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export const customerSupportTickets = pgTable("customerSupportTickets", {
  ticketId: serial("ticketId").primaryKey(),
  userId: integer("userId").references(() => users.userId, {
    onDelete: "cascade",
  }),
  subject: varchar("subject", { length: 255 }).notNull(),
  description: text("description").notNull(),
  reply: varchar("reply", { length: 255 }),
  status: ticketStatusEnum("status").default("Open").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export const cities = pgTable("cities", {
  cityId: serial("cityId").primaryKey(),
  cityName: varchar("cityName", { length: 100 }).notNull(),
  cityPicture: varchar("cityPicture", { length: 255 }),
  countryName: varchar("countryName", { length: 100 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const newsletterSubscribers = pgTable("newsletterSubscribers", {
  subscriberId: serial("subscriberId").primaryKey(),
  email: text("email").notNull().unique(),
  subscribedAt: timestamp("subscribedAt").defaultNow(),
});

export const contactMessages = pgTable("contactMessages", {
  messageId: serial("messageId").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

// ====================== RELATIONS ======================
export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  tickets: many(customerSupportTickets),
  addresses: many(addresses, { relationName: "userAddresses" }),
  wishlist: many(wishlist),
  ownedHotels: many(hotels, { relationName: "hotelOwner" }),
}));

export const hotelsRelations = relations(hotels, ({ many, one }) => ({
  rooms: many(rooms),
  addresses: many(addresses, { relationName: "hotelAddresses" }),
  amenities: many(entityAmenities, { relationName: "hotelAmenities" }),
  owner: one(users, {
    fields: [hotels.ownerId],
    references: [users.userId],
    relationName: "hotelOwner",
  }),
}));

export const roomsRelations = relations(rooms, ({ one, many }) => ({
  hotel: one(hotels, {
    fields: [rooms.hotelId],
    references: [hotels.hotelId],
  }),
  roomType: one(roomTypes, {
    fields: [rooms.roomTypeId],
    references: [roomTypes.roomTypeId],
  }),
  reviews: many(reviews),
  bookings: many(bookings),
  amenities: many(entityAmenities, { relationName: "roomAmenities" }),
  wishlist: many(wishlist),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, {
    fields: [addresses.entityId],
    references: [users.userId],
    relationName: "userAddresses",
  }),
  hotel: one(hotels, {
    fields: [addresses.entityId],
    references: [hotels.hotelId],
    relationName: "hotelAddresses",
  }),
}));

export const amenitiesRelations = relations(amenities, ({ many }) => ({
  entities: many(entityAmenities),
}));

export const entityAmenitiesRelations = relations(
  entityAmenities,
  ({ one }) => ({
    amenity: one(amenities, {
      fields: [entityAmenities.amenityId],
      references: [amenities.amenityId],
    }),
    room: one(rooms, {
      fields: [entityAmenities.entityId],
      references: [rooms.roomId],
      relationName: "roomAmenities",
    }),
    hotel: one(hotels, {
      fields: [entityAmenities.entityId],
      references: [hotels.hotelId],
      relationName: "hotelAmenities",
    }),
  })
);

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

export const customerSupportTicketsRelations = relations(
  customerSupportTickets,
  ({ one }) => ({
    user: one(users, {
      fields: [customerSupportTickets.userId],
      references: [users.userId],
    }),
  })
);

export const wishlistRelations = relations(wishlist, ({ one }) => ({
  user: one(users, {
    fields: [wishlist.userId],
    references: [users.userId],
  }),
  room: one(rooms, {
    fields: [wishlist.roomId],
    references: [rooms.roomId],
  }),
}));

export const roomTypesRelations = relations(roomTypes, ({ many }) => ({
  rooms: many(rooms),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.userId],
  }),
  booking: one(bookings, {
    fields: [reviews.bookingId],
    references: [bookings.bookingId],
  }),
  room: one(rooms, {
    fields: [reviews.roomId],
    references: [rooms.roomId],
  }),
  hotel: one(hotels, {
    fields: [reviews.hotelId],
    references: [hotels.hotelId],
  }),
}));

export const citiesRelations = relations(cities, () => ({}));

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

export type TCustomerSupportTicketSelect =
  typeof customerSupportTickets.$inferSelect;
export type TCustomerSupportTicketInsert =
  typeof customerSupportTickets.$inferInsert;

export type TAddressSelect = typeof addresses.$inferSelect;
export type TAddressInsert = typeof addresses.$inferInsert;

export type TAmenitySelect = typeof amenities.$inferSelect;
export type TAmenityInsert = typeof amenities.$inferInsert;

export type TEntityAmenitySelect = typeof entityAmenities.$inferSelect;
export type TEntityAmenityInsert = typeof entityAmenities.$inferInsert;

export type TWishlistSelect = typeof wishlist.$inferSelect;
export type TWishlistInsert = typeof wishlist.$inferInsert;

export type TCitySelect = typeof cities.$inferSelect;
export type TCityInsert = typeof cities.$inferInsert;

export type TNewsletterSubscriberSelect =
  typeof newsletterSubscribers.$inferSelect;
export type TNewsletterSubscriberInsert =
  typeof newsletterSubscribers.$inferInsert;

export type TContactMessagesSelect = typeof contactMessages.$inferSelect;
export type TContactMessagesInsert = typeof contactMessages.$inferInsert;

export type TReviewSelect = typeof reviews.$inferSelect;
export type TReviewInsert = typeof reviews.$inferInsert;

export type TRoomTypeSelect = typeof roomTypes.$inferSelect;
export type TRoomTypeInsert = typeof roomTypes.$inferInsert;
