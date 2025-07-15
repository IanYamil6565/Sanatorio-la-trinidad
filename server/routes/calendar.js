import express from 'express';
import { executeQuery } from '../config/database.js';

const router = express.Router();

// Get all calendar events
router.get('/', async (req, res) => {
  try {
    const { type, attendee, startDate, endDate } = req.query;
    
    let query = `
      SELECT ce.*, CONCAT(s.first_name, ' ', s.last_name) as created_by_name
      FROM calendar_events ce
      JOIN staff s ON ce.created_by = s.id
      WHERE 1=1
    `;
    const params = [];

    if (type) {
      query += ` AND ce.type = ?`;
      params.push(type);
    }

    if (attendee) {
      query += ` AND JSON_SEARCH(ce.attendees, 'one', ?) IS NOT NULL`;
      params.push(`%${attendee}%`);
    }

    if (startDate) {
      query += ` AND ce.start_date >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND ce.end_date <= ?`;
      params.push(endDate);
    }

    query += ` ORDER BY ce.start_date ASC, ce.start_time ASC`;

    const events = await executeQuery(query, params);
    
    // Parse JSON fields and format response
    const formattedEvents = events.map(event => ({
      ...event,
      attendees: event.attendees ? JSON.parse(event.attendees) : [],
      createdBy: event.created_by_name,
      startDate: event.start_date,
      endDate: event.end_date,
      startTime: event.start_time,
      endTime: event.end_time,
      isAllDay: Boolean(event.is_all_day)
    }));

    res.json(formattedEvents);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

// Get calendar event by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const events = await executeQuery(`
      SELECT ce.*, CONCAT(s.first_name, ' ', s.last_name) as created_by_name
      FROM calendar_events ce
      JOIN staff s ON ce.created_by = s.id
      WHERE ce.id = ?
    `, [id]);

    if (events.length === 0) {
      return res.status(404).json({ error: 'Calendar event not found' });
    }

    const event = events[0];
    const formattedEvent = {
      ...event,
      attendees: event.attendees ? JSON.parse(event.attendees) : [],
      createdBy: event.created_by_name,
      startDate: event.start_date,
      endDate: event.end_date,
      startTime: event.start_time,
      endTime: event.end_time,
      isAllDay: Boolean(event.is_all_day)
    };

    res.json(formattedEvent);
  } catch (error) {
    console.error('Error fetching calendar event:', error);
    res.status(500).json({ error: 'Failed to fetch calendar event' });
  }
});

// Create new calendar event
router.post('/', async (req, res) => {
  try {
    const {
      title, description, startDate, endDate, startTime, endTime,
      type, location, attendees, createdBy, isAllDay, color
    } = req.body;

    const result = await executeQuery(
      `INSERT INTO calendar_events (title, description, start_date, end_date, start_time, end_time,
                                   type, location, attendees, created_by, is_all_day, color)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description || null, startDate, endDate, 
       isAllDay ? null : startTime, isAllDay ? null : endTime,
       type, location || null, JSON.stringify(attendees || []), 
       createdBy, Boolean(isAllDay), color || '#3B82F6']
    );

    const newEvent = await executeQuery(`
      SELECT ce.*, CONCAT(s.first_name, ' ', s.last_name) as created_by_name
      FROM calendar_events ce
      JOIN staff s ON ce.created_by = s.id
      WHERE ce.id = ?
    `, [result.insertId]);

    const event = newEvent[0];
    const formattedEvent = {
      ...event,
      attendees: event.attendees ? JSON.parse(event.attendees) : [],
      createdBy: event.created_by_name,
      startDate: event.start_date,
      endDate: event.end_date,
      startTime: event.start_time,
      endTime: event.end_time,
      isAllDay: Boolean(event.is_all_day)
    };

    res.status(201).json(formattedEvent);
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({ error: 'Failed to create calendar event' });
  }
});

// Update calendar event
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, description, startDate, endDate, startTime, endTime,
      type, location, attendees, isAllDay, color
    } = req.body;

    await executeQuery(
      `UPDATE calendar_events SET 
         title = ?, description = ?, start_date = ?, end_date = ?, start_time = ?, end_time = ?,
         type = ?, location = ?, attendees = ?, is_all_day = ?, color = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [title, description || null, startDate, endDate,
       isAllDay ? null : startTime, isAllDay ? null : endTime,
       type, location || null, JSON.stringify(attendees || []),
       Boolean(isAllDay), color || '#3B82F6', id]
    );

    const updatedEvent = await executeQuery(`
      SELECT ce.*, CONCAT(s.first_name, ' ', s.last_name) as created_by_name
      FROM calendar_events ce
      JOIN staff s ON ce.created_by = s.id
      WHERE ce.id = ?
    `, [id]);

    if (updatedEvent.length === 0) {
      return res.status(404).json({ error: 'Calendar event not found' });
    }

    const event = updatedEvent[0];
    const formattedEvent = {
      ...event,
      attendees: event.attendees ? JSON.parse(event.attendees) : [],
      createdBy: event.created_by_name,
      startDate: event.start_date,
      endDate: event.end_date,
      startTime: event.start_time,
      endTime: event.end_time,
      isAllDay: Boolean(event.is_all_day)
    };

    res.json(formattedEvent);
  } catch (error) {
    console.error('Error updating calendar event:', error);
    res.status(500).json({ error: 'Failed to update calendar event' });
  }
});

// Delete calendar event
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await executeQuery(
      'DELETE FROM calendar_events WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Calendar event not found' });
    }

    res.json({ message: 'Calendar event deleted successfully' });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    res.status(500).json({ error: 'Failed to delete calendar event' });
  }
});

export default router;