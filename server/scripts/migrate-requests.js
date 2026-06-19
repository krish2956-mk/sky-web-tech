import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function migrateRequests() {
  try {
    console.log('Connecting to MySQL Server...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'client_portal'
    });

    console.log('Creating project_requests table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS project_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        budget VARCHAR(100),
        deadline DATE,
        status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    console.log('project_requests table created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating project_requests table:', error);
    process.exit(1);
  }
}

migrateRequests();
