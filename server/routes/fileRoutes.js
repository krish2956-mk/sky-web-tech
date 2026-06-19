import express from 'express';
import { getFiles, uploadFile } from '../controllers/fileController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(verifyToken);

// File management routes tied to a specific project
router.get('/project/:projectId', getFiles);
router.post('/project/:projectId', upload.single('file'), uploadFile);

export default router;
