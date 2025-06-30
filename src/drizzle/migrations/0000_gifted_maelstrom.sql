CREATE TYPE "public"."booking_status" AS ENUM('Pending', 'Confirmed', 'Cancelled');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('Pending', 'Completed', 'Failed');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('Open', 'Resolved');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "bookings" (
	"bookingId" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"roomId" integer,
	"checkInDate" date NOT NULL,
	"checkOutDate" date NOT NULL,
	"totalAmount" numeric(10, 2) NOT NULL,
	"bookingStatus" "booking_status" NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "customerSupportTickets" (
	"ticketId" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"subject" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"status" "ticket_status" NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hotels" (
	"hotelId" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"location" varchar(255),
	"address" text NOT NULL,
	"contactPhone" varchar(20),
	"category" varchar(100),
	"rating" numeric(2, 1),
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"paymentId" serial PRIMARY KEY NOT NULL,
	"bookingId" integer,
	"amount" numeric(10, 2) NOT NULL,
	"paymentStatus" "payment_status" NOT NULL,
	"paymentDate" timestamp,
	"paymentMethod" varchar(50),
	"transactionId" varchar(255),
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"roomId" serial PRIMARY KEY NOT NULL,
	"hotelId" integer,
	"roomType" varchar(100) NOT NULL,
	"pricePerNight" numeric(10, 2) NOT NULL,
	"capacity" integer NOT NULL,
	"amenities" text[],
	"isAvailable" boolean DEFAULT true,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"userId" serial PRIMARY KEY NOT NULL,
	"firstName" varchar(100) NOT NULL,
	"lastName" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"contactPhone" varchar(20),
	"address" text,
	"role" "user_role" DEFAULT 'user',
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_userId_users_userId_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("userId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_roomId_rooms_roomId_fk" FOREIGN KEY ("roomId") REFERENCES "public"."rooms"("roomId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customerSupportTickets" ADD CONSTRAINT "customerSupportTickets_userId_users_userId_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("userId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_bookingId_bookings_bookingId_fk" FOREIGN KEY ("bookingId") REFERENCES "public"."bookings"("bookingId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_hotelId_hotels_hotelId_fk" FOREIGN KEY ("hotelId") REFERENCES "public"."hotels"("hotelId") ON DELETE cascade ON UPDATE no action;