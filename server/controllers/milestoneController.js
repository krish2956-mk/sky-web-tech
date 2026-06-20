import db from '../config/db.js';

// Get milestones for a specific project
export const getMilestones = async (req, res) => {
  const { projectId } = req.params;

  try {
    // Basic verification: if client, ensure they own the project
    if (req.user.role === 'Client') {
      const [projects] = await db.query('SELECT id FROM projects WHERE id = ? AND client_id = ?', [projectId, req.user.id]);
      if (projects.length === 0) {
        return res.status(403).json({ message: 'Access denied to this project\'s milestones.' });
      }
    }

    const [milestones] = await db.query('SELECT * FROM milestones WHERE project_id = ? ORDER BY created_at ASC', [projectId]);
    res.status(200).json(milestones);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching milestones.', error: error.message });
  }
};

// Create a milestone (Admin only)
export const createMilestone = async (req, res) => {
  const { projectId } = req.params;
  const { title, status, completion_percentage } = req.body;

  try {
    const [result] = await db.query(
      'INSERT INTO milestones (project_id, title, status, completion_percentage) VALUES (?, ?, ?, ?)',
      [projectId, title, status || 'Pending', completion_percentage || 0]
    );

    const newMilestone = {
      id: result.insertId,
      project_id: Number(projectId),
      title,
      status: status || 'Pending',
      completion_percentage: completion_percentage || 0
    };

    if (req.io) {
      req.io.to(`project_${projectId}`).emit('milestone_update', newMilestone);
    }

    res.status(201).json({ message: 'Milestone created successfully.', milestoneId: result.insertId, milestone: newMilestone });
  } catch (error) {
    res.status(500).json({ message: 'Server error while creating milestone.', error: error.message });
  }
};

// Update a milestone (Admin only)
export const updateMilestone = async (req, res) => {
  const { milestoneId } = req.params;
  const { title, status, completion_percentage } = req.body;

  try {
    await db.query(
      'UPDATE milestones SET title = ?, status = ?, completion_percentage = ? WHERE id = ?',
      [title, status, completion_percentage, milestoneId]
    );

    // Fetch the updated milestone to emit
    const [updatedRows] = await db.query('SELECT * FROM milestones WHERE id = ?', [milestoneId]);
    
    if (updatedRows.length > 0 && req.io) {
      req.io.to(`project_${updatedRows[0].project_id}`).emit('milestone_update', updatedRows[0]);
    }

    res.status(200).json({ message: 'Milestone updated successfully.', milestone: updatedRows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating milestone.', error: error.message });
  }
};

// Delete a milestone (Admin only)
export const deleteMilestone = async (req, res) => {
  const { milestoneId } = req.params;

  try {
    const [milestoneRows] = await db.query('SELECT project_id FROM milestones WHERE id = ?', [milestoneId]);
    if (milestoneRows.length === 0) {
      return res.status(404).json({ message: 'Milestone not found.' });
    }
    const projectId = milestoneRows[0].project_id;

    await db.query('DELETE FROM milestones WHERE id = ?', [milestoneId]);

    // We can emit a special event for deletion if we want, or just let clients refetch
    // For now, let's emit a deletion event
    if (req.io) {
      req.io.to(`project_${projectId}`).emit('milestone_deleted', { id: Number(milestoneId) });
    }

    res.status(200).json({ message: 'Milestone deleted successfully.', id: milestoneId });
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting milestone.', error: error.message });
  }
};
