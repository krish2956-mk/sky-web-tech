import express from 'express';
import { getProjects, createProject, updateProject } from '../controllers/projectController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Require valid token for all project routes
router.use(verifyToken);

router.get('/', getProjects);
router.post('/', isAdmin, createProject);
router.put('/:id', isAdmin, updateProject);

export default router;
