import db from '../config/db.js';
import path from 'path';

// Upload a file for a specific project
export const uploadFile = async (req, res) => {
  const { projectId } = req.params;

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    // RBAC: If Client, verify project ownership
    if (req.user.role === 'Client') {
      const [projects] = await db.query('SELECT id FROM projects WHERE id = ? AND client_id = ?', [projectId, req.user.id]);
      if (projects.length === 0) {
        return res.status(403).json({ message: 'Access denied. You can only upload files to your own projects.' });
      }
    }

    const fileName = req.file.originalname;
    const filePath = `/uploads/${req.file.filename}`;

    const [result] = await db.query(
      'INSERT INTO files (project_id, uploaded_by, file_name, file_path) VALUES (?, ?, ?, ?)',
      [projectId, req.user.id, fileName, filePath]
    );

    if (req.io) {
      req.io.to(`project_${projectId}`).emit('file_uploaded', { projectId });
    }

    res.status(201).json({ message: 'File uploaded successfully.', fileId: result.insertId, filePath, fileName });
  } catch (error) {
    res.status(500).json({ message: 'Server error while uploading file.', error: error.message });
  }
};

// Get files metadata for a specific project
export const getFiles = async (req, res) => {
  const { projectId } = req.params;

  try {
    // RBAC: If Client, verify project ownership
    if (req.user.role === 'Client') {
      const [projects] = await db.query('SELECT id FROM projects WHERE id = ? AND client_id = ?', [projectId, req.user.id]);
      if (projects.length === 0) {
        return res.status(403).json({ message: 'Access denied. You can only view files for your own projects.' });
      }
    }

    const [files] = await db.query(`
      SELECT f.id, f.file_name, f.file_path, f.created_at, u.name as uploaded_by_name, u.role as uploader_role
      FROM files f
      JOIN users u ON f.uploaded_by = u.id
      WHERE f.project_id = ?
      ORDER BY f.created_at DESC
    `, [projectId]);

    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching files.', error: error.message });
  }
};
