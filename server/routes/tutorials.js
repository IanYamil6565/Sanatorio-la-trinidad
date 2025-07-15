import express from 'express';
import { executeQuery } from '../config/database.js';

const router = express.Router();

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

// Get all tutorials
router.get('/', async (req, res) => {
  try {
    const { search, category, difficulty, author } = req.query;

    let query = `
      SELECT t.*, CONCAT(s.first_name, ' ', s.last_name) as author_name
      FROM tutorials t
      JOIN staff s ON t.author_id = s.id
      WHERE t.is_published = 1
    `;
    const params = [];

    if (search) {
      query += ` AND (
        t.title LIKE ? OR
        t.content LIKE ? OR
        JSON_SEARCH(t.tags, 'one', ?) IS NOT NULL
      )`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, `%${search}%`);
    }

    if (category) {
      query += ` AND t.category = ?`;
      params.push(category);
    }

    if (difficulty) {
      query += ` AND t.difficulty = ?`;
      params.push(difficulty);
    }

    if (author) {
      query += ` AND CONCAT(s.first_name, ' ', s.last_name) = ?`;
      params.push(author);
    }

    query += ` ORDER BY t.published_at DESC`;

    const tutorials = await executeQuery(query, params);

    const formattedTutorials = tutorials.map(tutorial => ({
      ...tutorial,
      author: tutorial.author_name,
      authorId: tutorial.author_id,
      tags: safeParseArray(tutorial.tags),
      steps: safeParseArray(tutorial.steps),
      estimatedTime: tutorial.estimated_time,
      isPublished: Boolean(tutorial.is_published),
      publishedAt: tutorial.published_at,
      updatedAt: tutorial.updated_at
    }));

    res.json(formattedTutorials);
  } catch (error) {
    console.error('Error fetching tutorials:', error);
    res.status(500).json({ error: 'Failed to fetch tutorials' });
  }
});

// Get tutorial by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tutorials = await executeQuery(`
      SELECT t.*, CONCAT(s.first_name, ' ', s.last_name) as author_name
      FROM tutorials t
      JOIN staff s ON t.author_id = s.id
      WHERE t.id = ?
    `, [id]);

    if (tutorials.length === 0) {
      return res.status(404).json({ error: 'Tutorial not found' });
    }

    const tutorial = tutorials[0];
    const formattedTutorial = {
      ...tutorial,
      author: tutorial.author_name,
      authorId: tutorial.author_id,
      tags: safeParseArray(tutorial.tags),
      steps: safeParseArray(tutorial.steps),
      estimatedTime: tutorial.estimated_time,
      isPublished: Boolean(tutorial.is_published),
      publishedAt: tutorial.published_at,
      updatedAt: tutorial.updated_at
    };

    res.json(formattedTutorial);
  } catch (error) {
    console.error('Error fetching tutorial:', error);
    res.status(500).json({ error: 'Failed to fetch tutorial' });
  }
});

// Create new tutorial
router.post('/', async (req, res) => {
  try {
    const {
      title, content, category, tags, authorId, difficulty,
      estimatedTime, steps, rating, isPublished
    } = req.body;

    const result = await executeQuery(
      `INSERT INTO tutorials (title, content, category, tags, author_id, difficulty,
                             estimated_time, steps, rating, is_published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, content, category, JSON.stringify(tags || []), authorId, difficulty,
       estimatedTime || 15, JSON.stringify(steps || []), rating || 0, Boolean(isPublished)]
    );

    const newTutorial = await executeQuery(`
      SELECT t.*, CONCAT(s.first_name, ' ', s.last_name) as author_name
      FROM tutorials t
      JOIN staff s ON t.author_id = s.id
      WHERE t.id = ?
    `, [result.insertId]);

    const tutorial = newTutorial[0];
    const formattedTutorial = {
      ...tutorial,
      author: tutorial.author_name,
      authorId: tutorial.author_id,
      tags: safeParseArray(tutorial.tags),
      steps: safeParseArray(tutorial.steps),
      estimatedTime: tutorial.estimated_time,
      isPublished: Boolean(tutorial.is_published),
      publishedAt: tutorial.published_at,
      updatedAt: tutorial.updated_at
    };

    res.status(201).json(formattedTutorial);
  } catch (error) {
    console.error('Error creating tutorial:', error);
    res.status(500).json({ error: 'Failed to create tutorial' });
  }
});

// Update tutorial
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, content, category, tags, difficulty,
      estimatedTime, steps, rating, isPublished
    } = req.body;

    await executeQuery(
      `UPDATE tutorials SET 
         title = ?, content = ?, category = ?, tags = ?, difficulty = ?,
         estimated_time = ?, steps = ?, rating = ?, is_published = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [title, content, category, JSON.stringify(tags || []), difficulty,
       estimatedTime || 15, JSON.stringify(steps || []), rating || 0, Boolean(isPublished), id]
    );

    const updatedTutorial = await executeQuery(`
      SELECT t.*, CONCAT(s.first_name, ' ', s.last_name) as author_name
      FROM tutorials t
      JOIN staff s ON t.author_id = s.id
      WHERE t.id = ?
    `, [id]);

    if (updatedTutorial.length === 0) {
      return res.status(404).json({ error: 'Tutorial not found' });
    }

    const tutorial = updatedTutorial[0];
    const formattedTutorial = {
      ...tutorial,
      author: tutorial.author_name,
      authorId: tutorial.author_id,
      tags: safeParseArray(tutorial.tags),
      steps: safeParseArray(tutorial.steps),
      estimatedTime: tutorial.estimated_time,
      isPublished: Boolean(tutorial.is_published),
      publishedAt: tutorial.published_at,
      updatedAt: tutorial.updated_at
    };

    res.json(formattedTutorial);
  } catch (error) {
    console.error('Error updating tutorial:', error);
    res.status(500).json({ error: 'Failed to update tutorial' });
  }
});

// Increment tutorial views
router.patch('/:id/view', async (req, res) => {
  try {
    const { id } = req.params;

    await executeQuery(
      'UPDATE tutorials SET views = views + 1 WHERE id = ?',
      [id]
    );

    res.json({ message: 'Tutorial view count updated' });
  } catch (error) {
    console.error('Error updating tutorial views:', error);
    res.status(500).json({ error: 'Failed to update tutorial views' });
  }
});

// Delete tutorial
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await executeQuery(
      'DELETE FROM tutorials WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tutorial not found' });
    }

    res.json({ message: 'Tutorial deleted successfully' });
  } catch (error) {
    console.error('Error deleting tutorial:', error);
    res.status(500).json({ error: 'Failed to delete tutorial' });
  }
});

// Get tutorial authors
router.get('/authors/list', async (req, res) => {
  try {
    const authors = await executeQuery(`
      SELECT DISTINCT CONCAT(s.first_name, ' ', s.last_name) as author_name
      FROM tutorials t
      JOIN staff s ON t.author_id = s.id
      WHERE t.is_published = 1
      ORDER BY author_name
    `);

    res.json(authors.map(a => a.author_name));
  } catch (error) {
    console.error('Error fetching tutorial authors:', error);
    res.status(500).json({ error: 'Failed to fetch tutorial authors' });
  }
});

export default router;
