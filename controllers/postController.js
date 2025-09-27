const postModel = require('../models/postModel');

exports.createPost = (req, res) => {
    try {
        const author_id = req.session.user.id;
        const { title, content, categories } = req.body;
        const imagePaths = req.files?.map(file => file.path) || [];

        postModel.createPost({ author_id, title, content }, (err, results) => {
            if (err) {
                console.error('Error creating post:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            const postId = results.insertId;
            if (categories && categories.length > 0) {
                postModel.addCategoriesToPost(postId, categories, (err) => {
                    if (err) console.error('Error adding categories:', err);
                });
            }
            if (imagePaths.length > 0) {
                postModel.addImagesToPost(postId, imagePaths, (err) => {
                    if (err) console.error('Error adding images:', err);
                });
            }

            postModel.getPostByID(postId, (err, newPost) => {
                if (err) {
                    console.error('Error fetching new post:', err);
                    return res.status(500).json({ error: 'Internal server error' });
                }

                res.status(201).json({
                    message: 'Post created successfully',
                    post: newPost
                });
            });
        });
    } catch (error) {
        console.error('Unexpected error creating post:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
