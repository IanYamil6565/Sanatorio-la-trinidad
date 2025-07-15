import { executeQuery, testConnection } from '../config/database.js';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '12345',
  port: process.env.DB_PORT || 3306,
  charset: 'utf8mb4'
};

async function createDatabase() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    await connection.execute(`CREATE DATABASE IF NOT EXISTS hospital_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log('✅ Database created successfully');
  } catch (error) {
    console.error('❌ Error creating database:', error);
  } finally {
    await connection.end();
  }
}

async function createTables() {
  const tables = [
    // Users table for authentication
    `CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin', 'doctor', 'nurse', 'staff') DEFAULT 'staff',
      staff_id INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_email (email),
      INDEX idx_staff_id (staff_id)
    )`,

    // Staff table
    `CREATE TABLE IF NOT EXISTS staff (
      id INT PRIMARY KEY AUTO_INCREMENT,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(20) NOT NULL,
      position VARCHAR(100) NOT NULL,
      department VARCHAR(100) NOT NULL,
      specialty VARCHAR(100) NULL,
      type ENUM('doctor', 'nurse', 'administrative', 'technician', 'reception', 'call_center') NOT NULL,
      status ENUM('active', 'inactive') DEFAULT 'active',
      hire_date DATE NOT NULL,
      avatar TEXT NULL,
      bio TEXT NULL,
      certifications JSON NULL,
      keywords JSON NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_type (type),
      INDEX idx_department (department),
      INDEX idx_status (status),
      INDEX idx_email (email)
    )`,

    // Patients table
    `CREATE TABLE IF NOT EXISTS patients (
      id INT PRIMARY KEY AUTO_INCREMENT,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      document VARCHAR(50) UNIQUE NOT NULL,
      phone VARCHAR(20) NOT NULL,
      email VARCHAR(255) NULL,
      birth_date DATE NULL,
      address TEXT NULL,
      emergency_contact VARCHAR(255) NULL,
      emergency_phone VARCHAR(20) NULL,
      medical_history TEXT NULL,
      allergies TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_document (document),
      INDEX idx_name (first_name, last_name)
    )`,

    // Appointments table
    `CREATE TABLE IF NOT EXISTS appointments (
      id INT PRIMARY KEY AUTO_INCREMENT,
      patient_id INT NOT NULL,
      doctor_id INT NOT NULL,
      appointment_date DATE NOT NULL,
      appointment_time TIME NOT NULL,
      status ENUM('confirmed', 'pending', 'cancelled', 'completed') DEFAULT 'pending',
      notes TEXT NULL,
      diagnosis TEXT NULL,
      treatment TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
      FOREIGN KEY (doctor_id) REFERENCES staff(id) ON DELETE CASCADE,
      INDEX idx_date (appointment_date),
      INDEX idx_doctor (doctor_id),
      INDEX idx_patient (patient_id),
      INDEX idx_status (status)
    )`,

    // Reminders table
    `CREATE TABLE IF NOT EXISTS reminders (
      id INT PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(255) NOT NULL,
      description TEXT NULL,
      type ENUM('task', 'meeting', 'deadline', 'maintenance', 'general') NOT NULL,
      priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
      due_date DATE NOT NULL,
      due_time TIME NULL,
      assigned_to INT NULL,
      created_by INT NOT NULL,
      status ENUM('pending', 'completed', 'overdue') DEFAULT 'pending',
      completed_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (assigned_to) REFERENCES staff(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by) REFERENCES staff(id) ON DELETE CASCADE,
      INDEX idx_due_date (due_date),
      INDEX idx_status (status),
      INDEX idx_priority (priority),
      INDEX idx_assigned_to (assigned_to)
    )`,

    // Blog posts table
    `CREATE TABLE IF NOT EXISTS blog_posts (
      id INT PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      author_id INT NOT NULL,
      category ENUM('announcement', 'news', 'policy', 'event') NOT NULL,
      tags JSON NULL,
      status ENUM('draft', 'published') DEFAULT 'draft',
      priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
      published_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES staff(id) ON DELETE CASCADE,
      INDEX idx_category (category),
      INDEX idx_status (status),
      INDEX idx_priority (priority),
      INDEX idx_published_at (published_at)
    )`,

    // Calendar events table
    `CREATE TABLE IF NOT EXISTS calendar_events (
      id INT PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(255) NOT NULL,
      description TEXT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      start_time TIME NULL,
      end_time TIME NULL,
      type ENUM('meeting', 'training', 'maintenance', 'event', 'holiday') NOT NULL,
      location VARCHAR(255) NULL,
      attendees JSON NULL,
      created_by INT NOT NULL,
      is_all_day BOOLEAN DEFAULT FALSE,
      color VARCHAR(7) DEFAULT '#3B82F6',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES staff(id) ON DELETE CASCADE,
      INDEX idx_start_date (start_date),
      INDEX idx_type (type),
      INDEX idx_created_by (created_by)
    )`,

    // Tutorials table
    `CREATE TABLE IF NOT EXISTS tutorials (
      id INT PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      category ENUM('procedures', 'software', 'equipment', 'policies', 'emergency') NOT NULL,
      tags JSON NULL,
      author_id INT NOT NULL,
      difficulty ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
      estimated_time INT DEFAULT 15,
      steps JSON NULL,
      views INT DEFAULT 0,
      rating DECIMAL(3,2) DEFAULT 0.00,
      is_published BOOLEAN DEFAULT TRUE,
      published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES staff(id) ON DELETE CASCADE,
      INDEX idx_category (category),
      INDEX idx_difficulty (difficulty),
      INDEX idx_published (is_published),
      INDEX idx_author (author_id)
    )`
  ];

  for (const table of tables) {
    try {
      await executeQuery(table);
      console.log('✅ Table created successfully');
    } catch (error) {
      console.error('❌ Error creating table:', error.message);
    }
  }
}

async function migrate() {
  console.log('🚀 Starting database migration...');
  
  try {
    await createDatabase();
    
    // Test connection with the new database
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Could not connect to database');
    }
    
    await createTables();
    
    console.log('✅ Migration completed successfully!');
    console.log('📝 Next steps:');
    console.log('   1. Run: npm run db:seed (to add sample data)');
    console.log('   2. Run: npm run dev (to start the application)');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

migrate();