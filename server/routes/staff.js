import express from 'express';
import { executeQuery } from '../config/database.js';

const router = express.Router();

// Utility to safely parse JSON/CSV-like array fields
function safeParseArray(value) {
  try {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string' && value.trim().startsWith('[')) {
      return JSON.parse(value);
    }
    return value.split(',').map(v => v.trim());
  } catch {
    return [];
  }
}

// Get all staff with filters
router.get('/', async (req, res) => {
  try {
    const { search, type, department, status } = req.query;
    
    let query = `
      SELECT id, first_name, last_name, email, phone, position, department, 
             specialty, type, status, hire_date, avatar, bio, certifications, keywords,
             created_at, updated_at
      FROM staff 
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (
        CONCAT(first_name, ' ', last_name) LIKE ? OR
        specialty LIKE ? OR
        department LIKE ? OR
        JSON_SEARCH(keywords, 'one', ?) IS NOT NULL
      )`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, `%${search}%`);
    }

    if (type && type !== 'all') {
      query += ` AND type = ?`;
      params.push(type);
    }

    if (department) {
      query += ` AND department = ?`;
      params.push(department);
    }

    if (status && status !== 'all') {
      query += ` AND status = ?`;
      params.push(status);
    }

    query += ` ORDER BY first_name, last_name`;

    const staff = await executeQuery(query, params);

    // Parse JSON/CSV-like fields
    const formattedStaff = staff.map(person => ({
      ...person,
      certifications: safeParseArray(person.certifications),
      keywords:        safeParseArray(person.keywords)
    }));

    res.json(formattedStaff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

// Get staff by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await executeQuery(
      'SELECT * FROM staff WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    const person = rows[0];
    person.certifications = safeParseArray(person.certifications);
    person.keywords       = safeParseArray(person.keywords);

    res.json(person);
  } catch (error) {
    console.error('Error fetching staff member:', error);
    res.status(500).json({ error: 'Failed to fetch staff member' });
  }
});

// Create new staff member
router.post('/', async (req, res) => {
  try {
    const {
      firstName, lastName, email, phone, position, department,
      specialty, type, status, hireDate, bio, avatar, certifications, keywords
    } = req.body;

    const result = await executeQuery(
      `INSERT INTO staff (
         first_name, last_name, email, phone, position, department, 
         specialty, type, status, hire_date, bio, avatar, certifications, keywords
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        firstName, lastName, email, phone, position, department,
        specialty || null, type, status, hireDate,
        bio       || null, avatar || null,
        JSON.stringify(certifications || []),
        JSON.stringify(keywords       || [])
      ]
    );

    const [newPerson] = await executeQuery(
      'SELECT * FROM staff WHERE id = ?',
      [result.insertId]
    );

    newPerson.certifications = safeParseArray(newPerson.certifications);
    newPerson.keywords       = safeParseArray(newPerson.keywords);

    res.status(201).json(newPerson);
  } catch (error) {
    console.error('Error creating staff member:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create staff member' });
    }
  }
});

// Update staff member
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName, lastName, email, phone, position, department,
      specialty, type, status, hireDate, bio, avatar, certifications, keywords
    } = req.body;

    await executeQuery(
      `UPDATE staff SET 
         first_name    = ?, last_name     = ?, email = ?, phone = ?, position = ?,
         department    = ?, specialty     = ?, type  = ?, status = ?, hire_date = ?,
         bio           = ?, avatar        = ?, certifications = ?, keywords = ?,
         updated_at    = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        firstName, lastName, email, phone, position,
        department, specialty || null, type, status, hireDate,
        bio       || null, avatar       || null,
        JSON.stringify(certifications || []),
        JSON.stringify(keywords       || []),
        id
      ]
    );

    const [updatedPerson] = await executeQuery(
      'SELECT * FROM staff WHERE id = ?',
      [id]
    );

    if (!updatedPerson) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    updatedPerson.certifications = safeParseArray(updatedPerson.certifications);
    updatedPerson.keywords       = safeParseArray(updatedPerson.keywords);

    res.json(updatedPerson);
  } catch (error) {
    console.error('Error updating staff member:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update staff member' });
    }
  }
});

// Delete staff member
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await executeQuery(
      'DELETE FROM staff WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    res.json({ message: 'Staff member deleted successfully' });
  } catch (error) {
    console.error('Error deleting staff member:', error);
    res.status(500).json({ error: 'Failed to delete staff member' });
  }
});

// Get staff statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const [stats] = await executeQuery(`
      SELECT 
        COUNT(*) AS total,
        SUM(type = 'doctor')         AS doctors,
        SUM(type = 'nurse')          AS nurses,
        SUM(type = 'administrative') AS administrative,
        SUM(type = 'technician')     AS technicians,
        SUM(type = 'reception')      AS reception,
        SUM(type = 'call_center')    AS call_center,
        SUM(status = 'active')       AS active
      FROM staff
    `);

    res.json(stats);
  } catch (error) {
    console.error('Error fetching staff stats:', error);
    res.status(500).json({ error: 'Failed to fetch staff statistics' });
  }
});

// Get departments
router.get('/departments/list', async (req, res) => {
  try {
    const rows = await executeQuery(`
      SELECT DISTINCT department
      FROM staff
      WHERE department IS NOT NULL
      ORDER BY department
    `);

    res.json(rows.map(r => r.department));
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

export default router;
