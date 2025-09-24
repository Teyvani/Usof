const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const mainChecker = require('../middleware/mainChecker');
const validMiddleware = require('../middleware/validation');

const multer = require('multer');
const upload = multer({ dest: 'uploads/'} );

router.post('/create-post', validMiddleware.isLoggedIn, mainChecker.createPost, upload.array('postImages', 10), postController.createPost);

module.exports = router;