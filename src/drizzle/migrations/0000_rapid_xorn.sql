CREATE TYPE "public"."addressEntityType" AS ENUM('user', 'hotel');--> statement-breakpoint
CREATE TYPE "public"."amenityEntityType" AS ENUM('room', 'hotel');--> statement-breakpoint
CREATE TYPE "public"."bookingStatus" AS ENUM('Pending', 'Confirmed', 'Cancelled');--> statement-breakpoint
CREATE TYPE "public"."paymentMethod" AS ENUM('card', 'mpesa');--> statement-breakpoint
CREATE TYPE "public"."paymentStatus" AS ENUM('Pending', 'Completed', 'Failed');--> statement-breakpoint
CREATE TYPE "public"."ticketStatus" AS ENUM('Open', 'Resolved');--> statement-breakpoint
CREATE TYPE "public"."userRole" AS ENUM('user', 'owner', 'admin');--> statement-breakpoint
CREATE TABLE "addresses" (
	"addressId" serial PRIMARY KEY NOT NULL,
	"entityId" integer NOT NULL,
	"entityType" "addressEntityType" NOT NULL,
	"street" varchar(255) NOT NULL,
	"city" varchar(100) NOT NULL,
	"state" varchar(100),
	"postalCode" varchar(20) NOT NULL,
	"country" varchar(100) NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "amenities" (
	"amenityId" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"icon" varchar(50),
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"bookingId" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"roomId" integer,
	"checkInDate" date NOT NULL,
	"checkOutDate" date NOT NULL,
	"totalAmount" numeric(10, 2) NOT NULL,
	"bookingStatus" "bookingStatus" NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cities" (
	"cityId" serial PRIMARY KEY NOT NULL,
	"cityName" varchar(100) NOT NULL,
	"cityPicture" varchar(255),
	"countryName" varchar(100) NOT NULL,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contactMessages" (
	"messageId" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "customerSupportTickets" (
	"ticketId" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"subject" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"reply" varchar(255),
	"status" "ticketStatus" DEFAULT 'Open' NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "entityAmenities" (
	"id" serial PRIMARY KEY NOT NULL,
	"amenityId" integer,
	"entityId" integer NOT NULL,
	"entityType" "amenityEntityType" NOT NULL,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hotels" (
	"hotelId" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"ownerId" integer NOT NULL,
	"location" varchar(255),
	"thumbnail" varchar,
	"description" text,
	"gallery" varchar(255)[],
	"contactPhone" varchar(20),
	"category" varchar(100),
	"rating" numeric(2, 1),
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "newsletterSubscribers" (
	"subscriberId" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"subscribedAt" timestamp DEFAULT now(),
	CONSTRAINT "newsletterSubscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"paymentId" serial PRIMARY KEY NOT NULL,
	"bookingId" integer,
	"amount" numeric(10, 2) NOT NULL,
	"paymentStatus" "paymentStatus" NOT NULL,
	"paymentDate" timestamp,
	"paymentMethod" "paymentMethod",
	"transactionId" varchar(255),
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"reviewId" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"bookingId" integer NOT NULL,
	"roomId" integer,
	"hotelId" integer,
	"rating" numeric(2, 1) NOT NULL,
	"comment" text,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "roomTypes" (
	"roomTypeId" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"roomId" serial PRIMARY KEY NOT NULL,
	"hotelId" integer,
	"roomTypeId" integer,
	"pricePerNight" numeric(10, 2) NOT NULL,
	"capacity" integer NOT NULL,
	"thumbnail" varchar,
	"description" text,
	"gallery" varchar(255)[],
	"isAvailable" boolean DEFAULT true,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"userId" serial PRIMARY KEY NOT NULL,
	"firstName" varchar(100) NOT NULL,
	"lastName" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"profileImage" varchar,
	"bio" varchar,
	"password" varchar(255) NOT NULL,
	"contactPhone" varchar(20),
	"role" "userRole" DEFAULT 'user',
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "wishlist" (
	"wishlistId" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"roomId" integer,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_userId_users_userId_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("userId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_roomId_rooms_roomId_fk" FOREIGN KEY ("roomId") REFERENCES "public"."rooms"("roomId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customerSupportTickets" ADD CONSTRAINT "customerSupportTickets_userId_users_userId_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("userId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entityAmenities" ADD CONSTRAINT "entityAmenities_amenityId_amenities_amenityId_fk" FOREIGN KEY ("amenityId") REFERENCES "public"."amenities"("amenityId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotels" ADD CONSTRAINT "hotels_ownerId_users_userId_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."users"("userId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_bookingId_bookings_bookingId_fk" FOREIGN KEY ("bookingId") REFERENCES "public"."bookings"("bookingId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_users_userId_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("userId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_bookingId_bookings_bookingId_fk" FOREIGN KEY ("bookingId") REFERENCES "public"."bookings"("bookingId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_roomId_rooms_roomId_fk" FOREIGN KEY ("roomId") REFERENCES "public"."rooms"("roomId") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_hotelId_hotels_hotelId_fk" FOREIGN KEY ("hotelId") REFERENCES "public"."hotels"("hotelId") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_hotelId_hotels_hotelId_fk" FOREIGN KEY ("hotelId") REFERENCES "public"."hotels"("hotelId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_roomTypeId_roomTypes_roomTypeId_fk" FOREIGN KEY ("roomTypeId") REFERENCES "public"."roomTypes"("roomTypeId") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_userId_users_userId_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("userId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_roomId_rooms_roomId_fk" FOREIGN KEY ("roomId") REFERENCES "public"."rooms"("roomId") ON DELETE cascade ON UPDATE no action;