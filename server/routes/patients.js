import express from 'express';
import { executeQuery } from '../config/database.js';

const router = express.Router();

// Get all patients
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = 'SELECT * FROM patients WHERE 1=1';
    const params = [];

    if (search) {
      query += ` AND (
        CONCAT(first_name, ' ', last_name) LIKE ? OR
        document LIKE ? OR
        phone LIKE ? OR
        email LIKE ?
      )`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY first_name, last_name';

    const patients = await executeQuery(query, params);
    res.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// Get patient by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const patients = await executeQuery(
      'SELECT * FROM patients WHERE id = ?',
      [id]
    );

    if (patients.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json(patients[0]);
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
});

// Create new patient
router.post('/', async (req, res) => {
  try {
    const {
      firstName, lastName, document, phone, email, birthDate,
      address, emergencyContact, emergencyPhone, medicalHistory, allergies
    } = req.body;

    const result = await executeQuery(
      `INSERT INTO patients (first_name, last_name, document, phone, email, birth_date,
                            address, emergency_contact, emergency_phone, medical_history, allergies)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [firstName, lastName, document, phone, email || null, birthDate || null,
       address || null, emergencyContact || null, emergencyPhone || null,
       medicalHistory || null, allergies || null]
    );

    const newPatient = await executeQuery(
      'SELECT * FROM patients WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newPatient[0]);
  } catch (error) {
    console.error('Error creating patient:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Document number already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create patient' });
    }
  }
});

// Update patient
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName, lastName, document, phone, email, birthDate,
      address, emergencyContact, emergencyPhone, medicalHistory, allergies
    } = req.body;

    await executeQuery(
      `UPDATE patients SET 
         first_name = ?, last_name = ?, document = ?, phone = ?, email = ?,
         birth_date = ?, address = ?, emergency_contact = ?, emergency_phone = ?,
         medical_history = ?, allergies = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [firstName, lastName, document, phone, email || null, birthDate || null,
       address || null, emergencyContact || null, emergencyPhone || null,
       medicalHistory || null, allergies || null, id]
    );

    const updatedPatient = await executeQuery(
      'SELECT * FROM patients WHERE id = ?',
      [id]
    );

    if (updatedPatient.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json(updatedPatient[0]);
  } catch (error) {
    console.error('Error updating patient:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Document number already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update patient' });
    }
  }
});

// Delete patient
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await executeQuery(
      'DELETE FROM patients WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ error: 'Failed to delete patient' });
  }
});

export default router;