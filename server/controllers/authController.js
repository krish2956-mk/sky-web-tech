import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';

export const getClients = async (req, res) => {
  try {
    const [clients] = await db.query('SELECT id, name, email FROM users WHERE role = "Client" ORDER BY created_at DESC');
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching clients.', error: error.message });
  }
};

// Login User
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.', error: error.message || error.toString() });
  }
};

// Register new Client (Admin only)
export const registerClient = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const [result] = await db.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, password_hash, 'Client']
    );

    res.status(201).json({ message: 'Client registered successfully.', clientId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration.', error: error.message });
  }
};
// Public Signup
export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const [result] = await db.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, password_hash, 'Client']
    );

    // Generate JWT for immediate login
    const token = jwt.sign(
      { id: result.insertId, email, role: 'Client' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({ 
      message: 'User registered successfully.', 
      token,
      user: { id: result.insertId, name, email, role: 'Client' }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during signup.', error: error.message });
  }
};
