import express from 'express';
import { login, registerClient, signup, getClients } from '../controllers/authController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route for login
router.post('/login', login);

// Public route for signup
router.post('/signup', signup);

// Protected Admin route to provision new clients
router.post('/register', verifyToken, isAdmin, registerClient);

// Protected Admin route to get clients
router.get('/clients', verifyToken, isAdmin, getClients);

export default router;
