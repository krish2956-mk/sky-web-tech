import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function runMigration() {
  try {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'client_portal'
    });

    console.log('Altering messages table to add attachment columns...');
    await connection.query(`
      ALTER TABLE messages 
      ADD COLUMN attachment_url VARCHAR(500) DEFAULT NULL,
      ADD COLUMN attachment_name VARCHAR(255) DEFAULT NULL;
    `);

    console.log('Migration successful: Added attachment_url and attachment_name to messages.');
    process.exit(0);
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Migration already applied: Columns exist.');
      process.exit(0);
    } else {
      console.error('Error running migration:', error);
      process.exit(1);
    }
  }
}

runMigration();
