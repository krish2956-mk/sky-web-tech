import express from 'express';
import { getMilestones, createMilestone, updateMilestone, deleteMilestone } from '../controllers/milestoneController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

// Project milestones routes
router.get('/project/:projectId', getMilestones);
router.post('/project/:projectId', isAdmin, createMilestone);
router.put('/:milestoneId', isAdmin, updateMilestone);
router.delete('/:milestoneId', isAdmin, deleteMilestone);

export default router;
