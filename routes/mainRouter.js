const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const authMiddleware = require('../middleware/authentication');
const validMiddleware = require('../middleware/validation');

router.post('/register', authMiddleware.registerErrorHandler, userController.register);
router.get('/confirm-email', userController.confirmEmail);
router.post('/login', authMiddleware.loginErrorHandler, userController.login);
router.post('/logout', validMiddleware.isLoggedIn, userController.logout);

module.exports = router;