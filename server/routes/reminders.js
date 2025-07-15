import express from 'express';
import { executeQuery } from '../config/database.js';

const router = express.Router();

// Get all reminders
router.get('/', async (req, res) => {
  try {
    const { status, priority, assignedTo } = req.query;
    
    let query = `
      SELECT r.*, 
             CONCAT(s1.first_name, ' ', s1.last_name) as assigned_to_name,
             CONCAT(s2.first_name, ' ', s2.last_name) as created_by_name
      FROM reminders r
      LEFT JOIN staff s1 ON r.assigned_to = s1.id
      LEFT JOIN staff s2 ON r.created_by = s2.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      query += ` AND r.status = ?`;
      params.push(status);
    }

    if (priority) {
      query += ` AND r.priority = ?`;
      params.push(priority);
    }

    if (assignedTo) {
      query += ` AND r.assigned_to = ?`;
      params.push(assignedTo);
    }

    query += ` ORDER BY 
      CASE r.priority 
        WHEN 'urgent' THEN 1 
        WHEN 'high' THEN 2 
        WHEN 'medium' THEN 3 
        WHEN 'low' THEN 4 
      END,
      r.due_date ASC, r.due_time ASC
    `;

    const reminders = await executeQuery(query, params);
    res.json(reminders);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

// Create new reminder
router.post('/', async (req, res) => {
  try {
    const {
      title, description, type, priority, dueDate, dueTime,
      assignedTo, createdBy
    } = req.body;

    const result = await executeQuery(
      `INSERT INTO reminders (title, description, type, priority, due_date, due_time, assigned_to, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, type, priority, dueDate, dueTime || null, assignedTo || null, createdBy]
    );

    const newReminder = await executeQuery(`
      SELECT r.*, 
             CONCAT(s1.first_name, ' ', s1.last_name) as assigned_to_name,
             CONCAT(s2.first_name, ' ', s2.last_name) as created_by_name
      FROM reminders r
      LEFT JOIN staff s1 ON r.assigned_to = s1.id
      LEFT JOIN staff s2 ON r.created_by = s2.id
      WHERE r.id = ?
    `, [result.insertId]);

    res.status(201).json(newReminder[0]);
  } catch (error) {
    console.error('Error creating reminder:', error);
    res.status(500).json({ error: 'Failed to create reminder' });
  }
});

// Update reminder
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, description, type, priority, dueDate, dueTime,
      assignedTo, status
    } = req.body;

    await executeQuery(
      `UPDATE reminders SET 
         title = ?, description = ?, type = ?, priority = ?, due_date = ?, 
         due_time = ?, assigned_to = ?, status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [title, description, type, priority, dueDate, dueTime || null, assignedTo || null, status, id]
    );

    const updatedReminder = await executeQuery(`
      SELECT r.*, 
             CONCAT(s1.first_name, ' ', s1.last_name) as assigned_to_name,
             CONCAT(s2.first_name, ' ', s2.last_name) as created_by_name
      FROM reminders r
      LEFT JOIN staff s1 ON r.assigned_to = s1.id
      LEFT JOIN staff s2 ON r.created_by = s2.id
      WHERE r.id = ?
    `, [id]);

    if (updatedReminder.length === 0) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    res.json(updatedReminder[0]);
  } catch (error) {
    console.error('Error updating reminder:', error);
    res.status(500).json({ error: 'Failed to update reminder' });
  }
});

// Complete reminder
router.patch('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;

    await executeQuery(
      'UPDATE reminders SET status = ?, completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['completed', id]
    );

    const updatedReminder = await executeQuery(`
      SELECT r.*, 
             CONCAT(s1.first_name, ' ', s1.last_name) as assigned_to_name,
             CONCAT(s2.first_name, ' ', s2.last_name) as created_by_name
      FROM reminders r
      LEFT JOIN staff s1 ON r.assigned_to = s1.id
      LEFT JOIN staff s2 ON r.created_by = s2.id
      WHERE r.id = ?
    `, [id]);

    if (updatedReminder.length === 0) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    res.json(updatedReminder[0]);
  } catch (error) {
    console.error('Error completing reminder:', error);
    res.status(500).json({ error: 'Failed to complete reminder' });
  }
});

// Delete reminder
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await executeQuery(
      'DELETE FROM reminders WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    res.status(500).json({ error: 'Failed to delete reminder' });
  }
});

export default router;