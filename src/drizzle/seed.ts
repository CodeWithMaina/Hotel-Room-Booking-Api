import db from "./db";
import {
  users,
  hotels,
  rooms,
  roomTypes,
  bookings,
  payments,
  customerSupportTickets,
  addresses,
  amenities,
  entityAmenities,
  reviews,
  wishlist,
  cities,
  newsletterSubscribers,
  contactMessages,
  userRoleEnum,
  bookingStatusEnum,
  paymentStatusEnum,
  ticketStatusEnum,
  addressEntityTypeEnum,
  amenityEntityTypeEnum,
  paymentMethodEnum,
} from "./schema";

async function seedDatabase() {
  console.log("Starting database seeding...");

  // Clear existing data (be careful with this in production!)
  console.log("Clearing existing data...");
  await db.delete(reviews).execute();
  await db.delete(wishlist).execute();
  await db.delete(entityAmenities).execute();
  await db.delete(amenities).execute();
  await db.delete(addresses).execute();
  await db.delete(payments).execute();
  await db.delete(bookings).execute();
  await db.delete(rooms).execute();
  await db.delete(roomTypes).execute();
  await db.delete(hotels).execute();
  await db.delete(customerSupportTickets).execute();
  await db.delete(contactMessages).execute();
  await db.delete(newsletterSubscribers).execute();
  await db.delete(cities).execute();
  await db.delete(users).execute();

  // Seed Users with realistic profile images
  console.log("Seeding users...");
  const userData = await db
    .insert(users)
    .values([
      {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        profileImage:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=128&h=128&q=80",
        bio: "Frequent traveler and hotel enthusiast",
        password: "$2b$10$hashedpassword1",
        contactPhone: "+1234567890",
        role: userRoleEnum.enumValues[0], // 'user'
      },
      {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@example.com",
        profileImage:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=128&h=128&q=80",
        bio: "Business traveler with a passion for luxury stays",
        password: "$2b$10$hashedpassword2",
        contactPhone: "+1987654321",
        role: userRoleEnum.enumValues[0], // 'user'
      },
      {
        firstName: "Michael",
        lastName: "Johnson",
        email: "owner@example.com",
        profileImage:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=128&h=128&q=80",
        bio: "Hotel owner with 15 years of experience in hospitality",
        password: "$2b$10$hashedpassword3",
        contactPhone: "+1122334455",
        role: userRoleEnum.enumValues[1], // 'owner'
      },
      {
        firstName: "Sarah",
        lastName: "Williams",
        email: "admin@example.com",
        profileImage:
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=128&h=128&q=80",
        bio: "System administrator for the hotel booking platform",
        password: "$2b$10$hashedpassword4",
        contactPhone: "+1555666777",
        role: userRoleEnum.enumValues[2], // 'admin'
      },
    ])
    .returning();

  // Get the owner user (Michael Johnson)
  const ownerUser = userData.find(
    (user) => user.role === userRoleEnum.enumValues[1]
  );

  if (!ownerUser) {
    throw new Error(
      "No owner user found in seeded data. Cannot proceed with hotel seeding."
    );
  }

  // Seed Room Types
  console.log("Seeding room types...");
  const roomTypeData = await db
    .insert(roomTypes)
    .values([
      {
        name: "Deluxe King",
        description: "Spacious room with a king-size bed and premium amenities",
      },
      {
        name: "Executive Suite",
        description: "Luxurious suite with separate living area",
      },
      {
        name: "Standard Double",
        description: "Comfortable room with two double beds",
      },
      {
        name: "Ocean View",
        description: "Room with stunning ocean views",
      },
      {
        name: "Penthouse",
        description: "Ultra-luxurious top-floor accommodation",
      },
      {
        name: "Cabin Suite",
        description: "Rustic yet elegant mountain cabin-style room",
      },
    ])
    .returning();

  // Seed Hotels with realistic images
  console.log("Seeding hotels...");
  const hotelData = await db
    .insert(hotels)
    .values([
      {
        name: "Grand Plaza Hotel",
        ownerId: ownerUser.userId, // Set the owner
        location: "New York",
        thumbnail:
          "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80",
        description: "Luxury accommodations in the heart of Manhattan",
        gallery: [
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80",
          "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80",
          "https://images.unsplash.com/photo-1516496636080-14fb876e029d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80",
        ],
        contactPhone: "+12125551234",
        category: "Luxury",
        rating: "4.8",
      },
      {
        name: "Beachside Resort",
        ownerId: ownerUser.userId, // Set the owner
        location: "Miami",
        thumbnail:
          "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80",
        description: "Tropical paradise with private beach access",
        gallery: [
          "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80",
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80",
          "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80",
        ],
        contactPhone: "+13055556789",
        category: "Resort",
        rating: "4.5",
      },
      {
        name: "Mountain View Lodge",
        ownerId: ownerUser.userId, // Set the owner
        location: "Denver",
        thumbnail:
          "https://images.unsplash.com/photo-1582719471387-9d5d274e928f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80",
        description: "Rustic charm with modern amenities in the Rockies",
        gallery: [
          "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80",
          "https://images.unsplash.com/photo-1516496636080-14fb876e029d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80",
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80",
        ],
        contactPhone: "+17205551234",
        category: "Boutique",
        rating: "4.2",
      },
    ])
    .returning();

  // Seed Addresses
  console.log("Seeding addresses...");
  await db
    .insert(addresses)
    .values([
      // User addresses
      {
        entityId: userData[0].userId,
        entityType: addressEntityTypeEnum.enumValues[0], // 'user'
        street: "123 Main St",
        city: "New York",
        state: "NY",
        postalCode: "10001",
        country: "USA",
      },
      {
        entityId: userData[1].userId,
        entityType: addressEntityTypeEnum.enumValues[0], // 'user'
        street: "456 Oak Ave",
        city: "Los Angeles",
        state: "CA",
        postalCode: "90001",
        country: "USA",
      },
      // Hotel addresses
      {
        entityId: hotelData[0].hotelId,
        entityType: addressEntityTypeEnum.enumValues[1], // 'hotel'
        street: "789 Broadway",
        city: "New York",
        state: "NY",
        postalCode: "10003",
        country: "USA",
      },
      {
        entityId: hotelData[1].hotelId,
        entityType: addressEntityTypeEnum.enumValues[1], // 'hotel'
        street: "101 Ocean Drive",
        city: "Miami",
        state: "FL",
        postalCode: "33139",
        country: "USA",
      },
      {
        entityId: hotelData[2].hotelId,
        entityType: addressEntityTypeEnum.enumValues[1], // 'hotel'
        street: "202 Mountain Rd",
        city: "Denver",
        state: "CO",
        postalCode: "80202",
        country: "USA",
      },
    ])
    .execute();

  // Seed Amenities
  console.log("Seeding amenities...");
  const amenityData = await db
    .insert(amenities)
    .values([
      {
        name: "Wi-Fi",
        description: "High-speed internet access",
        icon: "wifi",
      },
      {
        name: "Swimming Pool",
        description: "Outdoor swimming pool",
        icon: "pool",
      },
      {
        name: "Gym",
        description: "Fully equipped fitness center",
        icon: "fitness_center",
      },
      { name: "Restaurant", description: "On-site dining", icon: "restaurant" },
      { name: "Spa", description: "Full-service spa", icon: "spa" },
      {
        name: "Parking",
        description: "Free parking available",
        icon: "local_parking",
      },
      { name: "TV", description: "Flat-screen TV", icon: "tv" },
      {
        name: "Air Conditioning",
        description: "Climate control",
        icon: "ac_unit",
      },
      {
        name: "Mini Bar",
        description: "In-room refreshments",
        icon: "local_bar",
      },
      {
        name: "Room Service",
        description: "24-hour room service",
        icon: "room_service",
      },
      {
        name: "King Bed",
        description: "Comfortable king-size bed",
        icon: "bed",
      },
      { name: "Double Bed", description: "Two double beds", icon: "bed" },
      { name: "Balcony", description: "Private balcony", icon: "balcony" },
    ])
    .returning();

  // Seed Rooms with realistic images
  console.log("Seeding rooms...");
  const roomValues = [
    // Grand Plaza Hotel rooms
    {
      hotelId: hotelData[0].hotelId,
      roomTypeId: roomTypeData[0].roomTypeId, // Deluxe King
      pricePerNight: "299.99",
      capacity: 2,
      thumbnail:
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80",
      description: "Spacious room with a king-size bed and premium amenities",
      gallery: [
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80",
        "https://images.unsplash.com/photo-1582719471387-9d5d274e928f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80",
        "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80",
      ],
      isAvailable: true,
    },
    {
      hotelId: hotelData[0].hotelId,
      roomTypeId: roomTypeData[1].roomTypeId, // Executive Suite
      pricePerNight: "499.99",
      capacity: 4,
      thumbnail:
        "https://images.unsplash.com/photo-1566669437685-b4247d84575d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80",
      description: "Luxurious suite with separate living area",
      gallery: [
        "https://images.unsplash.com/photo-1566669437685-b4247d84575d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80",
        "https://images.unsplash.com/photo-1516496636080-14fb876e029d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80",
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80",
      ],
      isAvailable: true,
    },
    {
      hotelId: hotelData[0].hotelId,
      roomTypeId: roomTypeData[2].roomTypeId, // Standard Double
      pricePerNight: "199.99",
      capacity: 2,
      thumbnail:
        "https://images.unsplash.com/photo-1595526114035-0d45a16a0f79?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80",
      description: "Comfortable room with two double beds",
      gallery: [
        "https://images.unsplash.com/photo-1595526114035-0d45a16a0f79?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80",
        "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80",
        "https://images.unsplash.com/photo-1516496636080-14fb876e029d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80",
      ],
      isAvailable: true,
    },
    // Beachside Resort rooms
    {
      hotelId: hotelData[1].hotelId,
      roomTypeId: roomTypeData[3].roomTypeId, // Ocean View
      pricePerNight: "349.99",
      capacity: 2,
      thumbnail:
        "https://images.unsplash.com/photo-1444201983204-c43cbd584d93?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80",
      description: "Room with stunning ocean views",
      gallery: [
        "https://images.unsplash.com/photo-1444201983204-c43cbd584d93?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80",
        "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80",
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80",
      ],
      isAvailable: true,
    },
    {
      hotelId: hotelData[1].hotelId,
      roomTypeId: roomTypeData[4].roomTypeId, // Penthouse
      pricePerNight: "799.99",
      capacity: 6,
      thumbnail:
        "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80",
      description: "Ultra-luxurious top-floor accommodation",
      gallery: [
        "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80",
        "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80",
        "https://images.unsplash.com/photo-1516496636080-14fb876e029d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80",
      ],
      isAvailable: true,
    },
    // Mountain View Lodge rooms
    {
      hotelId: hotelData[2].hotelId,
      roomTypeId: roomTypeData[5].roomTypeId, // Cabin Suite
      pricePerNight: "249.99",
      capacity: 4,
      thumbnail:
        "https://images.unsplash.com/photo-1582582621959-48d27397dc69?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80",
      description: "Rustic yet elegant mountain cabin-style room",
      gallery: [
        "https://images.unsplash.com/photo-1582582621959-48d27397dc69?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80",
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80",
        "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80",
      ],
      isAvailable: true,
    },
    {
      hotelId: hotelData[2].hotelId,
      roomTypeId: roomTypeData[2].roomTypeId, // Standard Double
      pricePerNight: "149.99",
      capacity: 2,
      thumbnail:
        "https://images.unsplash.com/photo-1566669437685-b4247d84575d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80",
      description: "Comfortable room with two double beds",
      gallery: [
        "https://images.unsplash.com/photo-1566669437685-b4247d84575d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80",
        "https://images.unsplash.com/photo-1516496636080-14fb876e029d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80",
        "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80",
      ],
      isAvailable: true,
    },
  ];
  const roomData = await db.insert(rooms).values(roomValues).returning();

  // Seed Entity Amenities (connecting amenities to rooms/hotels)
  console.log("Seeding entity amenities...");
  await db
    .insert(entityAmenities)
    .values([
      // Hotel amenities (shared by all rooms in the hotel)
      {
        amenityId: amenityData[0].amenityId,
        entityId: hotelData[0].hotelId,
        entityType: amenityEntityTypeEnum.enumValues[1],
      }, // Grand Plaza - WiFi
      {
        amenityId: amenityData[1].amenityId,
        entityId: hotelData[0].hotelId,
        entityType: amenityEntityTypeEnum.enumValues[1],
      }, // Grand Plaza - Pool
      {
        amenityId: amenityData[2].amenityId,
        entityId: hotelData[0].hotelId,
        entityType: amenityEntityTypeEnum.enumValues[1],
      }, // Grand Plaza - Gym
      {
        amenityId: amenityData[3].amenityId,
        entityId: hotelData[0].hotelId,
        entityType: amenityEntityTypeEnum.enumValues[1],
      }, // Grand Plaza - Restaurant
      {
        amenityId: amenityData[4].amenityId,
        entityId: hotelData[0].hotelId,
        entityType: amenityEntityTypeEnum.enumValues[1],
      }, // Grand Plaza - Spa
      {
        amenityId: amenityData[5].amenityId,
        entityId: hotelData[0].hotelId,
        entityType: amenityEntityTypeEnum.enumValues[1],
      }, // Grand Plaza - Parking

      {
        amenityId: amenityData[0].amenityId,
        entityId: hotelData[1].hotelId,
        entityType: amenityEntityTypeEnum.enumValues[1],
      }, // Beachside - WiFi
      {
        amenityId: amenityData[1].amenityId,
        entityId: hotelData[1].hotelId,
        entityType: amenityEntityTypeEnum.enumValues[1],
      }, // Beachside - Pool
      {
        amenityId: amenityData[3].amenityId,
        entityId: hotelData[1].hotelId,
        entityType: amenityEntityTypeEnum.enumValues[1],
      }, // Beachside - Restaurant
      {
        amenityId: amenityData[5].amenityId,
        entityId: hotelData[1].hotelId,
        entityType: amenityEntityTypeEnum.enumValues[1],
      }, // Beachside - Parking

      {
        amenityId: amenityData[0].amenityId,
        entityId: hotelData[2].hotelId,
        entityType: amenityEntityTypeEnum.enumValues[1],
      }, // Mountain View - WiFi
      {
        amenityId: amenityData[2].amenityId,
        entityId: hotelData[2].hotelId,
        entityType: amenityEntityTypeEnum.enumValues[1],
      }, // Mountain View - Gym
      {
        amenityId: amenityData[5].amenityId,
        entityId: hotelData[2].hotelId,
        entityType: amenityEntityTypeEnum.enumValues[1],
      }, // Mountain View - Parking

      // Room-specific amenities
      {
        amenityId: amenityData[6].amenityId,
        entityId: roomData[0].roomId,
        entityType: amenityEntityTypeEnum.enumValues[0],
      }, // Deluxe King - TV
      {
        amenityId: amenityData[7].amenityId,
        entityId: roomData[0].roomId,
        entityType: amenityEntityTypeEnum.enumValues[0],
      }, // Deluxe King - AC
      {
        amenityId: amenityData[8].amenityId,
        entityId: roomData[0].roomId,
        entityType: amenityEntityTypeEnum.enumValues[0],
      }, // Deluxe King - Mini Bar
      {
        amenityId: amenityData[10].amenityId,
        entityId: roomData[0].roomId,
        entityType: amenityEntityTypeEnum.enumValues[0],
      }, // Deluxe King - King Bed

      {
        amenityId: amenityData[6].amenityId,
        entityId: roomData[1].roomId,
        entityType: amenityEntityTypeEnum.enumValues[0],
      }, // Executive Suite - TV
      {
        amenityId: amenityData[7].amenityId,
        entityId: roomData[1].roomId,
        entityType: amenityEntityTypeEnum.enumValues[0],
      }, // Executive Suite - AC
      {
        amenityId: amenityData[9].amenityId,
        entityId: roomData[1].roomId,
        entityType: amenityEntityTypeEnum.enumValues[0],
      }, // Executive Suite - Room Service
      {
        amenityId: amenityData[12].amenityId,
        entityId: roomData[1].roomId,
        entityType: amenityEntityTypeEnum.enumValues[0],
      }, // Executive Suite - Balcony

      {
        amenityId: amenityData[6].amenityId,
        entityId: roomData[2].roomId,
        entityType: amenityEntityTypeEnum.enumValues[0],
      }, // Standard Double - TV
      {
        amenityId: amenityData[7].amenityId,
        entityId: roomData[2].roomId,
        entityType: amenityEntityTypeEnum.enumValues[0],
      }, // Standard Double - AC
      {
        amenityId: amenityData[11].amenityId,
        entityId: roomData[2].roomId,
        entityType: amenityEntityTypeEnum.enumValues[0],
      }, // Standard Double - Double Bed
    ])
    .execute();

  // Seed Bookings
  console.log("Seeding bookings...");
  const bookingData = await db
    .insert(bookings)
    .values([
      {
        userId: userData[0].userId,
        roomId: roomData[0].roomId,
        checkInDate: "2023-12-15",
        checkOutDate: "2023-12-20",
        totalAmount: "1499.95",
        bookingStatus: bookingStatusEnum.enumValues[1], // 'Confirmed'
      },
      {
        userId: userData[1].userId,
        roomId: roomData[3].roomId,
        checkInDate: "2024-01-10",
        checkOutDate: "2024-01-15",
        totalAmount: "1749.95",
        bookingStatus: bookingStatusEnum.enumValues[0], // 'Pending'
      },
      {
        userId: userData[0].userId,
        roomId: roomData[5].roomId,
        checkInDate: "2024-02-05",
        checkOutDate: "2024-02-10",
        totalAmount: "1249.95",
        bookingStatus: bookingStatusEnum.enumValues[1], // 'Confirmed'
      },
    ])
    .returning();

  // Seed Payments
  console.log("Seeding payments...");
  await db
    .insert(payments)
    .values([
      {
        bookingId: bookingData[0].bookingId,
        amount: "1499.95",
        paymentStatus: paymentStatusEnum.enumValues[1], // 'Completed'
        paymentDate: new Date("2023-11-20"),
        paymentMethod: paymentMethodEnum.enumValues[0], // 'card'
        transactionId: "PAY123456789",
      },
      {
        bookingId: bookingData[1].bookingId,
        amount: "500.00",
        paymentStatus: paymentStatusEnum.enumValues[0], // 'Pending'
        paymentDate: new Date("2024-01-10"),
        paymentMethod: paymentMethodEnum.enumValues[0], // 'card'
        transactionId: "PAY987654321",
      },
      {
        bookingId: bookingData[2].bookingId,
        amount: "1249.95",
        paymentStatus: paymentStatusEnum.enumValues[1], // 'Completed'
        paymentDate: new Date("2024-01-15"),
        paymentMethod: paymentMethodEnum.enumValues[0], // 'card'
        transactionId: "PAY456789123",
      },
    ])
    .execute();

  // Seed Customer Support Tickets
  console.log("Seeding customer support tickets...");
  await db
    .insert(customerSupportTickets)
    .values([
      {
        userId: userData[0].userId,
        subject: "Room change request",
        description:
          "I would like to request a room on a higher floor if possible.",
        reply: "We have upgraded you to a room on the 12th floor as requested.",
        status: ticketStatusEnum.enumValues[1], // 'Resolved'
      },
      {
        userId: userData[1].userId,
        subject: "Special dietary requirements",
        description:
          "I have gluten allergies and would like to know about meal options.",
        reply:
          "Our restaurant offers several gluten-free options marked on the menu.",
        status: ticketStatusEnum.enumValues[1], // 'Resolved'
      },
      {
        userId: userData[0].userId,
        subject: "Late check-out request",
        description: "Can I have a late check-out at 2pm instead of 11am?",
        reply: null,
        status: ticketStatusEnum.enumValues[0], // 'Open'
      },
    ])
    .execute();

  // Seed Reviews
  console.log("Seeding reviews...");
  await db
    .insert(reviews)
    .values([
      {
        userId: userData[0].userId,
        bookingId: bookingData[0].bookingId,
        roomId: roomData[0].roomId,
        hotelId: hotelData[0].hotelId,
        rating: "4.5",
        comment: "Excellent stay! The room was spacious and clean.",
      },
      {
        userId: userData[1].userId,
        bookingId: bookingData[1].bookingId,
        roomId: roomData[3].roomId,
        hotelId: hotelData[1].hotelId,
        rating: "5.0",
        comment: "The ocean view was breathtaking. Will definitely return!",
      },
    ])
    .execute();

  // Seed Wishlist
  console.log("Seeding wishlist...");
  await db
    .insert(wishlist)
    .values([
      {
        userId: userData[0].userId,
        roomId: roomData[4].roomId, // Penthouse
      },
      {
        userId: userData[1].userId,
        roomId: roomData[1].roomId, // Executive Suite
      },
    ])
    .execute();

  // Seed Cities
  console.log("Seeding cities...");
  await db
    .insert(cities)
    .values([
      {
        cityName: "New York",
        cityPicture:
          "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80",
        countryName: "USA",
      },
      {
        cityName: "Miami",
        cityPicture:
          "https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80",
        countryName: "USA",
      },
      {
        cityName: "Denver",
        cityPicture:
          "https://images.unsplash.com/photo-1470004914212-05527e49370b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80",
        countryName: "USA",
      },
    ])
    .execute();

  // Seed Newsletter Subscribers
  console.log("Seeding newsletter subscribers...");
  await db
    .insert(newsletterSubscribers)
    .values([
      {
        email: "john.doe@example.com",
      },
      {
        email: "jane.smith@example.com",
      },
    ])
    .execute();

  // Seed Contact Messages
  console.log("Seeding contact messages...");
  await db
    .insert(contactMessages)
    .values([
      {
        name: "Robert Johnson",
        email: "robert.j@example.com",
        message:
          "I'm interested in group booking options for my company retreat.",
      },
      {
        name: "Emily Davis",
        email: "emily.d@example.com",
        message: "Do you have any pet-friendly accommodations?",
      },
    ])
    .execute();

  console.log("Database seeding completed successfully!");
}

seedDatabase().catch((e) => {
  console.error("Error seeding database:", e);
  process.exit(1);
});
