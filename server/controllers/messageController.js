import db from '../config/db.js';

// Clear all messages for a project (Admin only)
export const clearMessages = async (req, res) => {
  const { projectId } = req.params;

  try {
    await db.query('DELETE FROM messages WHERE project_id = ?', [projectId]);

    if (req.io) {
      req.io.to(`project_${projectId}`).emit('chat_cleared', { projectId });
    }

    res.status(200).json({ message: 'Chat cleared successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while clearing messages.', error: error.message });
  }
};

// Get messages for a specific project
export const getMessages = async (req, res) => {
  const { projectId } = req.params;

  try {
    // RBAC: If Client, verify project ownership
    if (req.user.role === 'Client') {
      const [projects] = await db.query('SELECT id FROM projects WHERE id = ? AND client_id = ?', [projectId, req.user.id]);
      if (projects.length === 0) {
        return res.status(403).json({ message: 'Access denied. You can only view messages for your own projects.' });
      }
    }

    const [messages] = await db.query(`
      SELECT m.id, m.content, m.attachment_url, m.attachment_name, m.created_at, u.name as sender_name, u.role as sender_role 
      FROM messages m 
      JOIN users u ON m.sender_id = u.id 
      WHERE m.project_id = ? 
      ORDER BY m.created_at ASC
    `, [projectId]);

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching messages.', error: error.message });
  }
};

// Post a new message
export const postMessage = async (req, res) => {
  const { projectId } = req.params;
  const { content, attachment_url, attachment_name } = req.body;

  try {
    // RBAC: If Client, verify project ownership
    if (req.user.role === 'Client') {
      const [projects] = await db.query('SELECT id FROM projects WHERE id = ? AND client_id = ?', [projectId, req.user.id]);
      if (projects.length === 0) {
        return res.status(403).json({ message: 'Access denied. You can only post messages to your own projects.' });
      }
    }

    const [result] = await db.query(
      'INSERT INTO messages (project_id, sender_id, content, attachment_url, attachment_name) VALUES (?, ?, ?, ?, ?)',
      [projectId, req.user.id, content, attachment_url || null, attachment_name || null]
    );

    // Fetch the user's name to emit with the message
    const [user] = await db.query('SELECT name, role FROM users WHERE id = ?', [req.user.id]);

    const newMessage = {
      id: result.insertId,
      project_id: projectId,
      sender_id: req.user.id,
      sender_name: user[0].name,
      sender_role: user[0].role,
      content,
      attachment_url: attachment_url || null,
      attachment_name: attachment_name || null,
      created_at: new Date().toISOString()
    };

    // Emit real-time event
    if (req.io) {
      req.io.to(`project_${projectId}`).emit('new_message', newMessage);
    }

    res.status(201).json({ message: 'Message sent successfully.', messageId: result.insertId, message: newMessage });
  } catch (error) {
    res.status(500).json({ message: 'Server error while sending message.', error: error.message });
  }
};

// Delete a message
// RBAC: Admin can delete any message. Client can only delete their own messages,
// and only within a project they own.
export const deleteMessage = async (req, res) => {
  const { messageId } = req.params;

  try {
    const [rows] = await db.query('SELECT * FROM messages WHERE id = ?', [messageId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Message not found.' });
    }
    const targetMessage = rows[0];

    if (req.user.role === 'Client') {
      if (targetMessage.sender_id !== req.user.id) {
        return res.status(403).json({ message: 'Access denied. You can only delete your own messages.' });
      }
      const [projects] = await db.query('SELECT id FROM projects WHERE id = ? AND client_id = ?', [targetMessage.project_id, req.user.id]);
      if (projects.length === 0) {
        return res.status(403).json({ message: 'Access denied. You can only delete messages in your own projects.' });
      }
    }

    await db.query('DELETE FROM messages WHERE id = ?', [messageId]);

    if (req.io) {
      req.io.to(`project_${targetMessage.project_id}`).emit('message_deleted', {
        id: Number(messageId),
        project_id: targetMessage.project_id
      });
    }

    res.status(200).json({ message: 'Message deleted successfully.', id: Number(messageId) });
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting message.', error: error.message });
  }
};
