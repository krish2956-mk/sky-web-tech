import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function migrate() {
  try {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'client_portal',
      port: process.env.DB_PORT || 3306,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
    });

    console.log('Creating request_attachments table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS request_attachments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        request_id INT NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        title VARCHAR(255),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (request_id) REFERENCES project_requests(id) ON DELETE CASCADE
      );
    `);

    console.log('request_attachments table created successfully!');
    
    // Also ensure messages table has attachment columns
    console.log('Ensuring messages table has attachment columns...');
    try {
      await connection.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_url VARCHAR(500) NULL;`);
      await connection.query(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_name VARCHAR(255) NULL;`);
      console.log('Messages table updated.');
    } catch (e) {
      console.log('Messages columns already exist or skipped:', e.message);
    }

    // Ensure files table has uploader_role column
    console.log('Ensuring files table has uploader_role column...');
    try {
      await connection.query(`ALTER TABLE files ADD COLUMN IF NOT EXISTS uploader_role VARCHAR(50) DEFAULT 'Client' NULL;`);
      console.log('Files table updated.');
    } catch (e) {
      console.log('Files uploader_role column already exists or skipped:', e.message);
    }

    console.log('\nAll migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migrate();
