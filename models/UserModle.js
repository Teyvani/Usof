const db = require('./db.js');

/*Finders*/

function findByLogin(login, callback){
    const sql = 'SELECT * FROM users WHERE login = ?';
    db.query(sql, [login], (err, results) => {
        if (err) return callback(err);
        callback(null, results[0]);
    });
}

function findByEmail(email, callback){
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err) return callback(err);
        callback(null, results[0]);
    });
}

function findById(id, callback){
    const sql = 'SELECT * FROM users WHERE id =?';
    db.query(sql, [id], (err, results) => {
        if (err) return callback(err);
        callback(null, results[0]);
    });
}

/*Main functions*/

function createUser({ login, full_name, password, email}, callback) {
    const sql = 'INSERT INTO users (login, full_name, password, email) VALUES (?, ?, ?, ?)';
    db.query(sql, [login, full_name, password, email], (err, results) => {callback(err, results);});
}

function updateUser(id, fields, callback) {
    const fieldsToUpdate = [];
    const values = [];
    for (const field in fields) {
        fieldsToUpdate.push(`${field} = ?`);
        values.push(fields[field]);
    }
    values.push(id);

    const sql = `UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
    db.query(sql, values, (err, results) => {
        if (err) return callback(err);
        callback(null, results);
    });
}

function deleteUser(id, callback) {
    const sql = 'DELETE FROM users WHERE id = ?';
    db.query(sql, [id], (err, results) => {
        if (err) return callback(err);
        callback(null, results);
    });
}

/*Checkers*/

function isEmailTaken(email, callback){
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err) return callback(err);
        callback(null, results.length > 0);
    });
}

function isLoginTaken(login, callback){
    const sql = 'SELECT * FROM users WHERE login = ?';
    db.query(sql, [login], (err, results) => {
        if (err) return callback(err);
        callback(null, results.length > 0);
    });
}

/* Additional */

function getAllUsers(callback) {
    const sql = 'SELECT * FROM users';
    db.query(sql, (err, results) => {
        if (err) return callback(err);
        callback(null, results);
    });
}

module.exports = {findByLogin, findByEmail, findById, createUser, updateUser, deleteUser, isEmailTaken, isLoginTaken, getAllUsers};