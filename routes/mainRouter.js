const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const categoryModel = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authentication');
const validMiddleware = require('../middleware/validation');
const postRouter = require('./postsRouter');


const multer = require('multer');
const upload = multer({ dest: 'uploads/'} );

/* Authentication Routes */
router.post('/auth/register', authMiddleware.registerErrorHandler, userController.register);
router.get('/auth/confirm-email', userController.confirmEmail);
router.post('/auth/send-email-token-again', userController.sendEmailTokenAgain);
router.post('/auth/login', authMiddleware.loginErrorHandler, userController.login);
router.post('/auth/logout', validMiddleware.isLoggedIn, userController.logout);
router.post('/auth/reset-password-request', userController.passwordResetRequest);
router.post('/auth/reset-password', authMiddleware.passwordResetErrorHandler, userController.passwordResetConfirm);
router.get('/auth/reset-password', userController.passwordTokenPage);

/* User Routes */
router.get('/users', userController.getAllUsers);
router.get('/users/:user_id', userController.getUserById);
router.post('/users', validMiddleware.isLoggedIn, validMiddleware.isAdmin, userController.createUser);
router.patch('/users/avatar', validMiddleware.isLoggedIn, upload.single('avatar'), userController.uploadAvatar);
router.patch('/users/:user_id', validMiddleware.isLoggedIn, userController.updateUser);
router.delete('/users/:user_id', validMiddleware.isLoggedIn, validMiddleware.isAdmin, userController.deleteUser);
router.patch('/users/:user_id/role', validMiddleware.isLoggedIn, validMiddleware.isAdmin, userController.updateUserRole);
router.get('/profile/avatar/:id', userController.getAvatar);

/*Category Routes
TO-DO*/

/*Admin only routes*/
router.delete('/users/:id', validMiddleware.isLoggedIn, validMiddleware.isAdmin, userController.deleteUser);
router.patch('/users/:id/role', validMiddleware.isLoggedIn, validMiddleware.isAdmin, userController.updateUserRole);
router.

/*Posts Routes*/
router.use('/posts', postRouter);

module.exports = router;
