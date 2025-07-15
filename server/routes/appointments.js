import express from 'express';
import { executeQuery } from '../config/database.js';

const router = express.Router();

// Get all appointments with patient and doctor details
router.get('/', async (req, res) => {
  try {
    const { doctorId, specialty, date, status } = req.query;
    
    let query = `
      SELECT 
        a.id, a.appointment_date as date, a.appointment_time as time, 
        a.status, a.notes, a.diagnosis, a.treatment,
        a.created_at, a.updated_at,
        p.id as patient_id, p.first_name as patient_first_name, 
        p.last_name as patient_last_name, p.document as patient_document,
        p.phone as patient_phone, p.email as patient_email,
        s.id as doctor_id, CONCAT(s.first_name, ' ', s.last_name) as doctor_name,
        s.specialty as doctor_specialty, s.department as doctor_department
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN staff s ON a.doctor_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (doctorId) {
      query += ` AND a.doctor_id = ?`;
      params.push(doctorId);
    }

    if (specialty) {
      query += ` AND s.specialty LIKE ?`;
      params.push(`%${specialty}%`);
    }

    if (date) {
      query += ` AND a.appointment_date = ?`;
      params.push(date);
    }

    if (status && status !== 'all') {
      query += ` AND a.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY a.appointment_date DESC, a.appointment_time DESC`;

    const appointments = await executeQuery(query, params);
    
    // Format the response
    const formattedAppointments = appointments.map(apt => ({
      id: apt.id,
      patientId: apt.patient_id,
      doctorId: apt.doctor_id,
      date: apt.date,
      time: apt.time,
      status: apt.status,
      notes: apt.notes,
      diagnosis: apt.diagnosis,
      treatment: apt.treatment,
      createdAt: apt.created_at,
      updatedAt: apt.updated_at,
      patient: {
        id: apt.patient_id,
        firstName: apt.patient_first_name,
        lastName: apt.patient_last_name,
        document: apt.patient_document,
        phone: apt.patient_phone,
        email: apt.patient_email
      },
      doctor: {
        id: apt.doctor_id,
        name: apt.doctor_name,
        specialty: apt.doctor_specialty,
        department: apt.doctor_department
      }
    }));

    res.json(formattedAppointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Create new appointment
router.post('/', async (req, res) => {
  try {
    const { patientData, doctorId, date, time, notes } = req.body;

    // First, create or find the patient
    let patientId;
    const existingPatient = await executeQuery(
      'SELECT id FROM patients WHERE document = ?',
      [patientData.document]
    );

    if (existingPatient.length > 0) {
      patientId = existingPatient[0].id;
      // Update patient info
      await executeQuery(
        'UPDATE patients SET first_name = ?, last_name = ?, phone = ?, email = ? WHERE id = ?',
        [patientData.firstName, patientData.lastName, patientData.phone, patientData.email || null, patientId]
      );
    } else {
      // Create new patient
      const patientResult = await executeQuery(
        'INSERT INTO patients (first_name, last_name, document, phone, email) VALUES (?, ?, ?, ?, ?)',
        [patientData.firstName, patientData.lastName, patientData.document, patientData.phone, patientData.email || null]
      );
      patientId = patientResult.insertId;
    }

    // Check for conflicting appointments
    const conflictingAppointments = await executeQuery(
      'SELECT id FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? AND status != ?',
      [doctorId, date, time, 'cancelled']
    );

    if (conflictingAppointments.length > 0) {
      return res.status(400).json({ error: 'Time slot already booked' });
    }

    // Create the appointment
    const appointmentResult = await executeQuery(
      'INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [patientId, doctorId, date, time, 'confirmed', notes || null]
    );

    // Fetch the created appointment with details
    const newAppointment = await executeQuery(`
      SELECT 
        a.id, a.appointment_date as date, a.appointment_time as time, 
        a.status, a.notes, a.created_at, a.updated_at,
        p.id as patient_id, p.first_name as patient_first_name, 
        p.last_name as patient_last_name, p.document as patient_document,
        p.phone as patient_phone, p.email as patient_email,
        s.id as doctor_id, CONCAT(s.first_name, ' ', s.last_name) as doctor_name,
        s.specialty as doctor_specialty, s.department as doctor_department
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN staff s ON a.doctor_id = s.id
      WHERE a.id = ?
    `, [appointmentResult.insertId]);

    const apt = newAppointment[0];
    const formattedAppointment = {
      id: apt.id,
      patientId: apt.patient_id,
      doctorId: apt.doctor_id,
      date: apt.date,
      time: apt.time,
      status: apt.status,
      notes: apt.notes,
      createdAt: apt.created_at,
      updatedAt: apt.updated_at,
      patient: {
        id: apt.patient_id,
        firstName: apt.patient_first_name,
        lastName: apt.patient_last_name,
        document: apt.patient_document,
        phone: apt.patient_phone,
        email: apt.patient_email
      },
      doctor: {
        id: apt.doctor_id,
        name: apt.doctor_name,
        specialty: apt.doctor_specialty,
        department: apt.doctor_department
      }
    };

    res.status(201).json(formattedAppointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// Update appointment
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, status, notes, diagnosis, treatment } = req.body;

    await executeQuery(
      `UPDATE appointments SET 
         appointment_date = ?, appointment_time = ?, status = ?, 
         notes = ?, diagnosis = ?, treatment = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [date, time, status, notes || null, diagnosis || null, treatment || null, id]
    );

    // Fetch updated appointment
    const updatedAppointment = await executeQuery(`
      SELECT 
        a.id, a.appointment_date as date, a.appointment_time as time, 
        a.status, a.notes, a.diagnosis, a.treatment, a.created_at, a.updated_at,
        p.id as patient_id, p.first_name as patient_first_name, 
        p.last_name as patient_last_name, p.document as patient_document,
        p.phone as patient_phone, p.email as patient_email,
        s.id as doctor_id, CONCAT(s.first_name, ' ', s.last_name) as doctor_name,
        s.specialty as doctor_specialty, s.department as doctor_department
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN staff s ON a.doctor_id = s.id
      WHERE a.id = ?
    `, [id]);

    if (updatedAppointment.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const apt = updatedAppointment[0];
    const formattedAppointment = {
      id: apt.id,
      patientId: apt.patient_id,
      doctorId: apt.doctor_id,
      date: apt.date,
      time: apt.time,
      status: apt.status,
      notes: apt.notes,
      diagnosis: apt.diagnosis,
      treatment: apt.treatment,
      createdAt: apt.created_at,
      updatedAt: apt.updated_at,
      patient: {
        id: apt.patient_id,
        firstName: apt.patient_first_name,
        lastName: apt.patient_last_name,
        document: apt.patient_document,
        phone: apt.patient_phone,
        email: apt.patient_email
      },
      doctor: {
        id: apt.doctor_id,
        name: apt.doctor_name,
        specialty: apt.doctor_specialty,
        department: apt.doctor_department
      }
    };

    res.json(formattedAppointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// Cancel appointment
router.patch('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await executeQuery(
      'UPDATE appointments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['cancelled', id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
});

// Delete appointment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await executeQuery(
      'DELETE FROM appointments WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

// Generate time slots for a doctor on a specific date
router.get('/timeslots/:doctorId/:date', async (req, res) => {
  try {
    const { doctorId, date } = req.params;
    
    // Get existing appointments for this doctor on this date
    const existingAppointments = await executeQuery(
      'SELECT appointment_time FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND status != ?',
      [doctorId, date, 'cancelled']
    );

    const bookedTimes = existingAppointments.map(apt => apt.appointment_time);
    
    // Generate time slots (8:00 AM to 6:00 PM, 30-minute intervals)
    const slots = [];
    const startHour = 8;
    const endHour = 18;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
        const displayTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        slots.push({
          time: displayTime,
          available: !bookedTimes.includes(timeString)
        });
      }
    }

    res.json(slots);
  } catch (error) {
    console.error('Error generating time slots:', error);
    res.status(500).json({ error: 'Failed to generate time slots' });
  }
});

export default router;