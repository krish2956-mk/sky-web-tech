import express from 'express';
import { getMessages, postMessage } from '../controllers/messageController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

// Message routes tied to a specific project
router.get('/project/:projectId', getMessages);
router.post('/project/:projectId', postMessage);

export default router;
