const db = require('../db.js');

/* Main functions */

function createPost({ author_id, title, content }, callback){
    const sql = 'INSERT INTO posts (author_id, title, content) VALUES (?, ?, ?)';
    db.query(sql, [author_id, title, content], (err, results) => {
        callback(err, results);
    });
}

function getAllPosts(callback){
    const sql = `
        SELECT p.*, 
               GROUP_CONCAT(DISTINCT c.title) AS categories,
               GROUP_CONCAT(DISTINCT i.image_path) AS images
        FROM posts p
        LEFT JOIN post_categories pc ON p.id = pc.post_id
        LEFT JOIN categories c ON pc.category_id = c.id
        LEFT JOIN post_images i ON p.id = i.post_id
        GROUP BY p.id
        ORDER BY p.published_at DESC`;
    
    db.query(sql, (err, results) => {
        if (err) return callback(err);
        results.forEach(r => {
            r.categories = r.categories ? r.categories.split(',') : [];
            r.images = r.images ? r.images.split(',') : [];
        });
        callback(null, results);
    });
}

function getPostByID(id, callback){
    const sql = `
        SELECT p.*, 
               GROUP_CONCAT(DISTINCT c.title) AS categories,
               GROUP_CONCAT(DISTINCT i.image_path) AS images
        FROM posts p
        LEFT JOIN post_categories pc ON p.id = pc.post_id
        LEFT JOIN categories c ON pc.category_id = c.id
        LEFT JOIN post_images i ON p.id = i.post_id
        WHERE p.id = ?
        GROUP BY p.id`;
    
    db.query(sql, [id], (err, results) => {
        if (err) return callback(err);
        if (!results.length) return callback(null, null);

        const post = results[0];
        post.categories = post.categories ? post.categories.split(',') : [];
        post.images = post.images ? post.images.split(',') : [];
        callback(null, post);
    });
}

function updatePost(id, fields, callback){
    const fieldsToUpdate = [];
    const values = [];
    for (const field in fields) {
        fieldsToUpdate.push(`${field} = ?`);
        values.push(fields[field]);
    }
    values.push(id);

    const sql = `UPDATE posts SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
    db.query(sql, values, (err, results) => {
        if (err) return callback(err);
        callback(null, results);
    });
}

function deletePost(id, callback){
    const sql = `DELETE FROM posts WHERE id = ?`;
    db.query(sql, [id], (err, results) => {
        if(err) return callback(err);
        callback(null, results);
    });
}

function addCategoriesToPost(postId, categoryIds, callback){
    if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
        return callback(null, { affectedRows: 0 });
    }
    
    const values = categoryIds.map(catId => [postId, catId]);
    const sql = `INSERT INTO post_categories (post_id, category_id) VALUES ?`;
    db.query(sql, [values], (err, results) => {
        if (err) return callback(err);
        callback(null, results);
    });
}

function addImagesToPost(postId, imagePaths, callback){
    if (!Array.isArray(imagePaths) || imagePaths.length === 0) {
        return callback(null, { affectedRows: 0 });
    }
    
    const values = imagePaths.map(path => [postId, path]);
    const sql = `INSERT INTO post_images (post_id, image_path) VALUES ?`;
    db.query(sql, [values], (err, results) => {
        if (err) return callback(err);
        callback(null, results);
    });
}

module.exports = {createPost, getAllPosts, getPostByID, updatePost, deletePost, addCategoriesToPost, addImagesToPost};
