const db = require('../db.js');

function getAllCategories(callback){
    const sql = `SELECT * FROM categories`;
    db.query(sql, (err, results) => {
        if(err) return callback(err);
        callback(null, results);
    });
}

function getCategoryById(id, callback){
    const sql = `SELECT * FROM categories WHERE id = ?`;
    db.query(sql, [id], (err, results) => {
        if(err) return callback(err);
        callback(null, results);
    });
}

function getCategoryByTitle(title, callback){
    const sql = `SELECT * FROM categories WHERE title = ?`;
    db.query(sql, [title], (err, results) => {
        if(err) return callback(err);
        callback(null, results);
    });
}

function createCategory(title, callback){
    const sql = `INSERT INTO categories (title) VALUES (?)`;
    db.query(sql, [id, title], (err, results) => {callback(err, results)});
}

function deleteCategory(id, callback){
    const sql = `DELETE FROM categories WHERE id = ?`;
    db.query(sql, [id], (err, results) => {
        if(err) return callback(err);
        callback(null, results);
    });
}

module.exports = {getAllCategories, getCategoryById, getCategoryByTitle, createCategory, deleteCategory};
