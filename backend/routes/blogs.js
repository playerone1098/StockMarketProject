const express = require('express');
const { adminAuth } = require('../middleware/auth');
const blogController = require('../controllers/blogController');

const router = express.Router();

/**
 * @route GET /api/blogs
 * @desc Get all active blog posts (public, filterable, paginated)
 */
router.get('/', blogController.getAll);

/**
 * @route GET /api/blogs/featured
 * @desc Get featured blog posts (public)
 */
router.get('/featured', blogController.getFeatured);

/**
 * @route GET /api/blogs/admin/all
 * @desc Get all blog posts including inactive (admin)
 */
router.get('/admin/all', adminAuth, blogController.getAdminAll);

/**
 * @route GET /api/blogs/:slug
 * @desc Get a single blog post by slug (public)
 */
router.get('/:slug', blogController.getBySlug);

/**
 * @route POST /api/blogs
 * @desc Create a new blog post (admin)
 */
router.post('/', adminAuth, blogController.create);

/**
 * @route PUT /api/blogs/:id
 * @desc Update a blog post (admin)
 */
router.put('/:id', adminAuth, blogController.update);

/**
 * @route POST /api/blogs/sync-news
 * @desc Sync live news from stock.indianapi.in (admin)
 */
router.post('/sync-news', adminAuth, blogController.syncNews);

/**
 * @route DELETE /api/blogs/:id
 * @desc Delete a blog post (admin)
 */
router.delete('/:id', adminAuth, blogController.remove);

module.exports = router;
