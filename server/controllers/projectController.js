import db from '../config/db.js';

// Get all projects (Admins see all, Clients see only theirs)
export const getProjects = async (req, res) => {
  try {
    if (req.user.role === 'Admin') {
      const [projects] = await db.query(`
        SELECT p.*, u.name as client_name 
        FROM projects p 
        LEFT JOIN users u ON p.client_id = u.id 
        ORDER BY p.created_at DESC
      `);
      return res.status(200).json(projects);
    } else {
      const [projects] = await db.query(`
        SELECT p.*, u.name as client_name 
        FROM projects p 
        LEFT JOIN users u ON p.client_id = u.id 
        WHERE p.client_id = ? 
        ORDER BY p.created_at DESC
      `, [req.user.id]);
      return res.status(200).json(projects);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching projects.', error: error.message });
  }
};

// Create a new project (Admin only)
export const createProject = async (req, res) => {
  const { client_id, title, description, start_date, end_date } = req.body;

  try {
    const [result] = await db.query(
      'INSERT INTO projects (client_id, title, description, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
      [client_id, title, description, start_date, end_date]
    );

    res.status(201).json({ message: 'Project created successfully.', projectId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Server error while creating project.', error: error.message });
  }
};

// Update project (Admin only)
export const updateProject = async (req, res) => {
  const { id } = req.params;
  const { title, description, status, end_date } = req.body;

  try {
    await db.query(
      'UPDATE projects SET title = ?, description = ?, status = ?, end_date = ? WHERE id = ?',
      [title, description, status, end_date, id]
    );

    res.status(200).json({ message: 'Project updated successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating project.', error: error.message });
  }
};

// Delete project (Admin only)
export const deleteProject = async (req, res) => {
  const { id } = req.params;

  try {
    // Rely on ON DELETE CASCADE for related records or just delete the project
    await db.query('DELETE FROM projects WHERE id = ?', [id]);
    res.status(200).json({ message: 'Project deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting project.', error: error.message });
  }
};
