import express from 'express';
import { executeQuery } from '../config/database.js';

const router = express.Router();

// Get all blog posts
router.get('/', async (req, res) => {
  try {
    const { search, category, author, status } = req.query;
    
    let query = `
      SELECT bp.*, CONCAT(s.first_name, ' ', s.last_name) as author_name
      FROM blog_posts bp
      JOIN staff s ON bp.author_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (
        bp.title LIKE ? OR
        bp.content LIKE ? OR
        JSON_SEARCH(bp.tags, 'one', ?) IS NOT NULL
      )`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, `%${search}%`);
    }

    if (category) {
      query += ` AND bp.category = ?`;
      params.push(category);
    }

    if (author) {
      query += ` AND CONCAT(s.first_name, ' ', s.last_name) = ?`;
      params.push(author);
    }

    if (status && status !== 'all') {
      query += ` AND bp.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY 
      CASE bp.priority 
        WHEN 'high' THEN 1 
        WHEN 'medium' THEN 2 
        WHEN 'low' THEN 3 
      END,
      bp.published_at DESC
    `;

    const posts = await executeQuery(query, params);
    
    // Parse JSON fields and format response
    const formattedPosts = posts.map(post => ({
      ...post,
      author: post.author_name,
      authorId: post.author_id,
      tags: post.tags ? JSON.parse(post.tags) : [],
      publishedAt: post.published_at,
      updatedAt: post.updated_at
    }));

    res.json(formattedPosts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

// Get blog post by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const posts = await executeQuery(`
      SELECT bp.*, CONCAT(s.first_name, ' ', s.last_name) as author_name
      FROM blog_posts bp
      JOIN staff s ON bp.author_id = s.id
      WHERE bp.id = ?
    `, [id]);

    if (posts.length === 0) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    const post = posts[0];
    const formattedPost = {
      ...post,
      author: post.author_name,
      authorId: post.author_id,
      tags: post.tags ? JSON.parse(post.tags) : [],
      publishedAt: post.published_at,
      updatedAt: post.updated_at
    };

    res.json(formattedPost);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ error: 'Failed to fetch blog post' });
  }
});

// Create new blog post
router.post('/', async (req, res) => {
  try {
    const {
      title, content, excerpt, authorId, category, tags, status, priority
    } = req.body;

    const publishedAt = status === 'published' ? new Date() : null;

    const result = await executeQuery(
      `INSERT INTO blog_posts (title, content, excerpt, author_id, category, tags, status, priority, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, content, excerpt, authorId, category, JSON.stringify(tags || []), status, priority, publishedAt]
    );

    const newPost = await executeQuery(`
      SELECT bp.*, CONCAT(s.first_name, ' ', s.last_name) as author_name
      FROM blog_posts bp
      JOIN staff s ON bp.author_id = s.id
      WHERE bp.id = ?
    `, [result.insertId]);

    const post = newPost[0];
    const formattedPost = {
      ...post,
      author: post.author_name,
      authorId: post.author_id,
      tags: post.tags ? JSON.parse(post.tags) : [],
      publishedAt: post.published_at,
      updatedAt: post.updated_at
    };

    res.status(201).json(formattedPost);
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ error: 'Failed to create blog post' });
  }
});

// Update blog post
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, content, excerpt, category, tags, status, priority
    } = req.body;

    // If changing to published and wasn't published before, set published_at
    const currentPost = await executeQuery('SELECT status, published_at FROM blog_posts WHERE id = ?', [id]);
    let publishedAt = currentPost[0]?.published_at;
    
    if (status === 'published' && currentPost[0]?.status !== 'published') {
      publishedAt = new Date();
    }

    await executeQuery(
      `UPDATE blog_posts SET 
         title = ?, content = ?, excerpt = ?, category = ?, tags = ?, 
         status = ?, priority = ?, published_at = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [title, content, excerpt, category, JSON.stringify(tags || []), status, priority, publishedAt, id]
    );

    const updatedPost = await executeQuery(`
      SELECT bp.*, CONCAT(s.first_name, ' ', s.last_name) as author_name
      FROM blog_posts bp
      JOIN staff s ON bp.author_id = s.id
      WHERE bp.id = ?
    `, [id]);

    if (updatedPost.length === 0) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    const post = updatedPost[0];
    const formattedPost = {
      ...post,
      author: post.author_name,
      authorId: post.author_id,
      tags: post.tags ? JSON.parse(post.tags) : [],
      publishedAt: post.published_at,
      updatedAt: post.updated_at
    };

    res.json(formattedPost);
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ error: 'Failed to update blog post' });
  }
});

// Delete blog post
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await executeQuery(
      'DELETE FROM blog_posts WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ error: 'Failed to delete blog post' });
  }
});

// Get blog authors
router.get('/authors/list', async (req, res) => {
  try {
    const authors = await executeQuery(`
      SELECT DISTINCT CONCAT(s.first_name, ' ', s.last_name) as author_name
      FROM blog_posts bp
      JOIN staff s ON bp.author_id = s.id
      ORDER BY author_name
    `);

    res.json(authors.map(a => a.author_name));
  } catch (error) {
    console.error('Error fetching blog authors:', error);
    res.status(500).json({ error: 'Failed to fetch blog authors' });
  }
});

export default router;