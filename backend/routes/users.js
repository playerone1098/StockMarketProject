const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { adminAuth } = require('../middleware/auth');

router.use(adminAuth);

router.get('/', userController.getUsers);
router.post('/', userController.createUser);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.patch('/:id/status', userController.toggleUserStatus);
router.delete('/:id', userController.deleteUser);

module.exports = router;
