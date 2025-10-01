const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const categoryController = require('../controllers/categoryController');
const commentController = require('../controllers/commentController');
const likeController = require('../controllers/likeController');
const postController = require('../controllers/postController');
const mainChecker = require('../middleware/mainChecker');
const authMiddleware = require('../middleware/authentication');
const validMiddleware = require('../middleware/validation');

const multer = require('multer');
const upload = multer({ dest: 'uploads/'} );

/* Authentication Routes */
router.post('/auth/register', mainChecker.emptyBody, authMiddleware.registerErrorHandler, userController.register);
router.get('/auth/confirm-email', userController.confirmEmail);
router.post('/auth/send-email-token-again', mainChecker.emptyBody, userController.sendEmailTokenAgain);
router.post('/auth/login', mainChecker.emptyBody, authMiddleware.loginErrorHandler, userController.login);
router.post('/auth/logout', mainChecker.emptyBody, validMiddleware.isLoggedIn, userController.logout);
router.post('/auth/reset-password-request', mainChecker.emptyBody, userController.passwordResetRequest);
router.post('/auth/reset-password', mainChecker.emptyBody, authMiddleware.passwordResetErrorHandler, userController.passwordResetConfirm);
router.get('/auth/reset-password', userController.passwordTokenPage);

/* User Routes */
router.get('/users', userController.getAllUsers);
router.get('/users/:user_id', userController.getUserById);
router.post('/users', mainChecker.emptyBody, validMiddleware.isLoggedIn, validMiddleware.isAdmin, userController.createUser);
router.patch('/users/avatar', mainChecker.emptyBody, validMiddleware.isLoggedIn, upload.single('avatar'), userController.uploadAvatar);
router.patch('/users/:user_id', mainChecker.emptyBody, validMiddleware.isLoggedIn, userController.updateUser);
router.delete('/users/:user_id', validMiddleware.isLoggedIn, validMiddleware.isAdmin, userController.deleteUser);
router.patch('/users/:user_id/role', mainChecker.emptyBody, validMiddleware.isLoggedIn, validMiddleware.isAdmin, userController.updateUserRole);
router.get('/profile/avatar/:id', userController.getAvatar);

/*Category Routes*/
router.get('/categories', categoryController.getAllCategories);
router.get('/categories/:category_id', categoryController.getCategoryById);
router.get('/categories/:category_id/posts', categoryController.getCategoryPosts);
router.post('/categories', mainChecker.emptyBody, validMiddleware.isLoggedIn, validMiddleware.isAdmin, categoryController.createCategory);
router.patch('/categories/:category_id', mainChecker.emptyBody, validMiddleware.isLoggedIn, validMiddleware.isAdmin, categoryController.updateCategory);
router.delete('/categories/:category_id', validMiddleware.isLoggedIn, validMiddleware.isAdmin, categoryController.deleteCategory);

/*Comment Routes*/
router.get('/comments/:comment_id', commentController.getCommentById);
router.get('/comments/:comment_id/like', commentController.getCommentLikes);
router.post('/comments/:comment_id/like', mainChecker.emptyBody, validMiddleware.isLoggedIn, likeController.addCommentLike);
router.patch('/comments/:comment_id', mainChecker.emptyBody, validMiddleware.isLoggedIn, commentController.updateComment);
router.delete('/comments/:comment_id', validMiddleware.isLoggedIn, commentController.deleteComment);
router.delete('/comments/:comment_id/like', validMiddleware.isLoggedIn, likeController.deleteCommentLike);

/*Posts Routes*/
router.get('/posts', postController.getAllPosts);
router.get('/posts/:post_id', postController.getPostById);
router.post('/posts', mainChecker.emptyBody, validMiddleware.isLoggedIn, mainChecker.createPost, upload.array('postImages', 10), postController.createPost);
router.patch('/posts/:post_id', mainChecker.emptyBody, validMiddleware.isLoggedIn, mainChecker.updatePost, postController.updatePost);
router.delete('/posts/:post_id', validMiddleware.isLoggedIn, postController.deletePost);
router.get('/posts/:post_id/comments', commentController.getPostComments);
router.post('/posts/:post_id/comments', mainChecker.emptyBody, validMiddleware.isLoggedIn, mainChecker.createComment, commentController.createComment);
router.get('/posts/:post_id/categories', postController.getPostCategories);
router.get('/posts/:post_id/like', likeController.getPostLikes);
router.post('/posts/:post_id/like', mainChecker.emptyBody, validMiddleware.isLoggedIn, likeController.addPostLike);
router.delete('/posts/:post_id/like', validMiddleware.isLoggedIn, likeController.deletePostLike);

/* TO-DO:
Posibility for a user to see only theirs posts including innactive */

module.exports = router;
