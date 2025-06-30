import express, {Response } from 'express';
import dotenv from 'dotenv';
import { userRouter } from './user/user.route';
import cors from 'cors';
import { bookingRouter } from './booking/booking.route';
import { hotelRouter } from './hotel/hotel.route';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


// Basic Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(logger);
// app.use(rateLimiterMiddleware);

//default route
app.get('/', (req, res:Response) => {
  res.send("Welcome to Hotel Room Booking Backend");
});

// Enable CORS for all routes
app.use(cors());

// Or configure specific origins
app.use(cors({
  origin: ['http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


//import route
app.use('/api',userRouter);
app.use('/api',bookingRouter);
app.use('/api',hotelRouter);



app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
 });
  