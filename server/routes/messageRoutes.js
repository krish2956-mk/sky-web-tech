import express from 'express';
import { getMessages, postMessage, deleteMessage, clearMessages } from '../controllers/messageController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

// Message routes tied to a specific project
router.get('/project/:projectId', getMessages);
router.post('/project/:projectId', postMessage);
router.delete('/project/:projectId/clear', isAdmin, clearMessages);
router.delete('/:messageId', deleteMessage);

export default router;
