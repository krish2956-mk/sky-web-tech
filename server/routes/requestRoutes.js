import express from 'express';
import { submitRequest, getRequests, approveRequest, rejectRequest } from '../controllers/requestController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(verifyToken);

// Client submits request (with optional file attachments)
router.post('/', upload.array('files', 10), submitRequest);

// Admin gets all requests
router.get('/', isAdmin, getRequests);

// Admin approves request
router.put('/:id/approve', isAdmin, approveRequest);

// Admin rejects request
router.put('/:id/reject', isAdmin, rejectRequest);

export default router;
