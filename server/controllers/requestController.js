import db from '../config/db.js';

// Client submits a request (with optional file attachments)
export const submitRequest = async (req, res) => {
  const { title, description, budget, deadline, attachmentsMeta } = req.body;

  try {
    // Insert the main request record
    const [result] = await db.query(
      'INSERT INTO project_requests (client_id, title, description, budget, deadline) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, title, description, budget, deadline || null]
    );

    const requestId = result.insertId;

    // Parse the per-file metadata (titles + descriptions sent as a JSON string)
    let metaArray = [];
    try {
      metaArray = attachmentsMeta ? JSON.parse(attachmentsMeta) : [];
    } catch (e) {
      metaArray = [];
    }

    // Save each uploaded file record to the database
    const savedAttachments = [];
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const meta = metaArray[i] || {};
        const fileTitle = meta.title || file.originalname;
        const fileDescription = meta.description || '';
        const filePath = `/uploads/${file.filename}`;

        await db.query(
          'INSERT INTO request_attachments (request_id, file_name, original_name, file_path, title, description) VALUES (?, ?, ?, ?, ?, ?)',
          [requestId, file.filename, file.originalname, filePath, fileTitle, fileDescription]
        );

        savedAttachments.push({
          file_name: file.filename,
          original_name: file.originalname,
          file_path: filePath,
          title: fileTitle,
          description: fileDescription,
        });
      }
    }

    // Fetch client name for the real-time event
    const [user] = await db.query('SELECT name FROM users WHERE id = ?', [req.user.id]);

    const newRequest = {
      id: requestId,
      client_id: req.user.id,
      client: user[0].name,
      type: 'Project Request',
      title,
      description,
      budget,
      deadline,
      status: 'Pending',
      created_at: new Date().toISOString(),
      attachments: savedAttachments,
    };

    if (req.io) {
      req.io.to('admin_room').emit('new_project_request', newRequest);
    }

    res.status(201).json({ message: 'Request submitted successfully.', request: newRequest });
  } catch (error) {
    console.error('Error submitting request:', error);
    res.status(500).json({ message: 'Server error while submitting request.', error: error.message });
  }
};

// Admin fetches all requests (with attachments)
export const getRequests = async (req, res) => {
  try {
    const [requests] = await db.query(`
      SELECT pr.*, u.name as client
      FROM project_requests pr
      JOIN users u ON pr.client_id = u.id
      ORDER BY pr.created_at DESC
    `);

    // Fetch attachments for each request
    const requestIds = requests.map(r => r.id);
    let attachmentsMap = {};

    if (requestIds.length > 0) {
      const [attachments] = await db.query(
        `SELECT * FROM request_attachments WHERE request_id IN (${requestIds.map(() => '?').join(',')})`,
        requestIds
      );
      attachments.forEach(att => {
        if (!attachmentsMap[att.request_id]) attachmentsMap[att.request_id] = [];
        attachmentsMap[att.request_id].push(att);
      });
    }

    const mappedRequests = requests.map(r => ({
      ...r,
      type: 'Project Request',
      attachments: attachmentsMap[r.id] || [],
    }));

    res.status(200).json(mappedRequests);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching requests.', error: error.message });
  }
};

// Admin approves request (Creates project)
export const approveRequest = async (req, res) => {
  const { id } = req.params;
  
  try {
    // 1. Update request status
    await db.query('UPDATE project_requests SET status = "Approved" WHERE id = ?', [id]);

    // 2. Fetch request details to emit to client
    const [requestRows] = await db.query('SELECT * FROM project_requests WHERE id = ?', [id]);
    const requestData = requestRows[0];

    if (req.io) {
      req.io.to(`client_${requestData.client_id}`).emit('request_approved', { requestId: id, title: requestData.title });
    }

    res.status(200).json({ message: 'Request approved successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while approving request.', error: error.message });
  }
};

// Admin rejects request
export const rejectRequest = async (req, res) => {
  const { id } = req.params;
  
  try {
    await db.query('UPDATE project_requests SET status = "Rejected" WHERE id = ?', [id]);
    
    const [requestRows] = await db.query('SELECT client_id, title FROM project_requests WHERE id = ?', [id]);
    if (requestRows.length > 0 && req.io) {
       req.io.to(`client_${requestRows[0].client_id}`).emit('request_rejected', { requestId: id, title: requestRows[0].title });
    }

    res.status(200).json({ message: 'Request rejected successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while rejecting request.', error: error.message });
  }
};
