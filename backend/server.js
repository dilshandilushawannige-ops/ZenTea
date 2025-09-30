import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { Server } from 'socket.io';

import { connectDB } from './config/db.js';
import authRoutes from './modules/auth/routes/authRoutes.js';
import supplierPaymentRoutes from './modules/payments/supplier/routes/supplierPaymentRoutes.js';
import salaryRoutes from './modules/salary/salaryRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import inventoryRouter from './modules/inventory/routes/inventoryRoutes.js';
import salesRouter from './modules/sales/routes/salesRoute.js';

dotenv.config();
const app = express();
const server = http.createServer(app);

// Updated CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow tools like Postman
    if (process.env.NODE_ENV === 'production') {
      const allowedOrigins = process.env.CLIENT_URL
        ? process.env.CLIENT_URL.split(',').map(origin => origin.trim()).filter(Boolean)
        : [];
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      // Dev mode: allow any localhost origin
      if (origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true
};

const io = new Server(server, { cors: corsOptions });

// inject io to requests
app.use((req, res, next) => { req.io = io; next(); });

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

connectDB();

// Static file serving
app.use('/files', express.static('tmp'));
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => res.json({ ok: true }));

// Existing root endpoint
app.get('/', (req, res) => res.send('Tea Factory Backend OK'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/payments/supplier', supplierPaymentRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/inventory', inventoryRouter);
app.use('/api/sales', salesRouter);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    const port = process.env.PORT || 5000;

    await new Promise((resolve, reject) => {
      server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          console.log(`Port ${port} is busy, trying ${port + 1}`);
          server.listen(port + 1);
        } else {
          reject(error);
        }
      });

      server.on('listening', () => {
        const address = server.address();
        console.log(`Server running on port ${address.port}`);
        resolve();
      });

      server.listen(port);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();



