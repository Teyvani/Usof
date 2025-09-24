const postModel = require('../models/postModel');

exports.createPost = async (req, res) => {
    try {
        const author_id = req.session.user.id;
        const { title, content, categories } = req.body;

        postModel.createPost({ author_id, title, content }, (err, result) => {
            if (err) {
                console.error('Error creating post:', err);
                return res.status(500).send({ error: 'Failed to create post.' });
            }

            const postId = result.insertId;
            let completedOperations = 0;
            let totalOperations = 0;
            let hasError = false;

            const checkCompletion = () => {
                completedOperations++;
                if (completedOperations === totalOperations && !hasError) {
                    return res.status(201).send({ message: 'Post created successfully', postId });
                }
            };

            if (categories && categories.length > 0) {
                totalOperations++;
                postModel.addCategoriesToPost(postId, categories, (err) => {
                    if (err && !hasError) {
                        hasError = true;
                        console.error('Error adding categories:', err);
                        return res.status(500).send({ error: 'Post created but failed to add categories' });
                    }
                    checkCompletion();
                });
            }

            if (req.files && req.files.length > 0) {
                totalOperations++;
                const imagePaths = req.files.map(file => file.path);
                postModel.addImagesToPost(postId, imagePaths, (err) => {
                    if (err && !hasError) {
                        hasError = true;
                        console.error('Error adding images:', err);
                        return res.status(500).send({ error: 'Post created but failed to add images' });
                    }
                    checkCompletion();
                });
            }

            if (totalOperations === 0) {
                return res.status(201).send({ message: 'Post created successfully', postId });
            }
        });

    } catch (error) {
        console.error('Unexpected error:', error);
        return res.status(500).send({ error: 'Internal server error' });
    }
};
