import db from './db';
import { 
  users, 
  hotels, 
  rooms, 
  bookings, 
  payments, 
  customerSupportTickets 
} from './schema';

const seedDatabase = async () => {
  try {
    // Clear existing data in correct order (child to parent)
    // await db.delete(payments);
    // await db.delete(customerSupportTickets);
    // await db.delete(bookings);
    // await db.delete(rooms);
    // await db.delete(hotels);
    // await db.delete(users);

    // Seed Users
    const insertedUsers = await db.insert(users).values([
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@hotel.com',
        password: 'admin', 
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'user@hotel.com',
        password: 'user',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]).returning();

    const [admin, user] = insertedUsers;

    // Seed Hotels
    const insertedHotels = await db.insert(hotels).values([
      {
        name: 'Grand Plaza',
        location: 'New York',
        address: '123 Luxury Avenue',
        contactPhone: '+1234567890',
        category: '5-star',
        rating: '4.8',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Cozy Inn',
        location: 'Chicago',
        address: '456 Comfort Street',
        contactPhone: '+1987654321',
        category: '3-star',
        rating: '3.9',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]).returning();

    const [grandPlaza, cozyInn] = insertedHotels;

    // Seed Rooms
    const insertedRooms = await db.insert(rooms).values([
      {
        hotelId: grandPlaza.hotelId,
        roomType: 'Deluxe Suite',
        pricePerNight: '350.00',
        capacity: 2,
        amenities: ['TV', 'Minibar', 'Jacuzzi'],
        isAvailable: true,
        createdAt: new Date()
      },
      {
        hotelId: grandPlaza.hotelId,
        roomType: 'Executive Room',
        pricePerNight: '250.00',
        capacity: 2,
        amenities: ['TV', 'Work Desk'],
        isAvailable: true,
        createdAt: new Date()
      },
      {
        hotelId: cozyInn.hotelId,
        roomType: 'Standard Room',
        pricePerNight: '120.00',
        capacity: 2,
        amenities: ['TV'],
        isAvailable: true,
        createdAt: new Date()
      },
      {
        hotelId: cozyInn.hotelId,
        roomType: 'Single Room',
        pricePerNight: '80.00',
        capacity: 1,
        amenities: [],
        isAvailable: true,
        createdAt: new Date()
      }
    ]).returning();

    const [deluxeSuite, executiveRoom, standardRoom, singleRoom] = insertedRooms;

    // Seed Bookings
    const insertedBookings = await db.insert(bookings).values([
      {
        userId: user.userId,
        roomId: deluxeSuite.roomId,
        checkInDate: '2023-12-15',
        checkOutDate: '2023-12-17',
        totalAmount: '700.00',
        bookingStatus: 'Confirmed',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: user.userId,
        roomId: standardRoom.roomId,
        checkInDate: '2023-11-01',
        checkOutDate: '2023-11-05',
        totalAmount: '480.00',
        bookingStatus: 'Cancelled',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]).returning();

    const [booking1, booking2] = insertedBookings;

    // Seed Payments
    await db.insert(payments).values([
      {
        bookingId: booking1.bookingId,
        amount: '700.00',
        paymentStatus: 'Completed',
        paymentDate: new Date(), 
        paymentMethod: 'credit_card',
        transactionId: 'pmt_123456',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        bookingId: booking2.bookingId,
        amount: '480.00',
        paymentStatus: 'Completed',
        paymentDate: new Date(), 
        paymentMethod: 'paypal',
        transactionId: 'pmt_789012',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Seed Support Tickets
    await db.insert(customerSupportTickets).values([
      {
        userId: user.userId,
        subject: 'Late check-out request',
        description: 'Can I have a late check-out at 2pm?',
        status: 'Open',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: admin.userId,
        subject: 'System feedback',
        description: 'The dashboard needs performance improvements',
        status: 'Resolved',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error; 
  }
};

// Execute and handle exit explicitly
seedDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));