const express = require('express');
const router = express.Router();
const socialController = require('../controllers/socialController');
const { auth, adminAuth } = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');

// Public Feed & Stock Community Routes
router.get('/posts', socialController.getAllPosts);
router.get('/trending', socialController.getTrendingStocks);
router.get('/posts/:id', socialController.getPostById);
router.get('/posts/:id/comments', socialController.getComments);

// Interactive User Routes (Requires JWT Authentication)
router.post('/posts', auth, socialController.createPost);
router.post('/posts/:id/like', auth, socialController.toggleLike);
router.post('/posts/:id/comments', auth, socialController.addComment);
router.post('/posts/:id/report', auth, socialController.reportPost);


// Admin Moderation Routes
router.get('/admin/posts', adminAuth, socialController.getAdminPosts);
router.patch('/admin/posts/:id', adminAuth, socialController.moderatePost);
router.delete('/admin/posts/:id', adminAuth, socialController.deletePost);

module.exports = router;
