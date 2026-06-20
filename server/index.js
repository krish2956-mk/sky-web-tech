import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/db.js';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL, 'http://localhost:5173'] : 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Make io accessible in our routers
app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on('connection', (socket) => {
  console.log('WebSocket client connected:', socket.id);

  socket.on('join_project_room', (projectId) => {
    const room = `project_${projectId}`;
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });

  socket.on('join_admin_room', () => {
    socket.join('admin_room');
    console.log(`Socket ${socket.id} joined admin_room`);
  });

  socket.on('join_client_room', (clientId) => {
    const room = `client_${clientId}`;
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('WebSocket client disconnected:', socket.id);
  });
});

import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import milestoneRoutes from './routes/milestoneRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes Integration
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/milestones', milestoneRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/requests', requestRoutes);

// Basic Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'API is running smoothly.' });
});

// Port configuration
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server & WebSocket running on port ${PORT}`);
});
