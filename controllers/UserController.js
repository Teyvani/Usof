const userModel = require('../models/userModel.js');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

exports.register = async (req, res) => {
    const { login, full_name, password, email } = req.body;

    try {
        userModel.findByLogin(login, (err, user) => {
            if (err) return res.status(500).send('Database error.');
            if (user) return res.status(400).send('Login already in use.');

            userModel.findByEmail(email, async (err, user) => {
                if (err) return res.status(500).send('Database error.');
                if (user) return res.status(400).send('Email already in use.');

                try {
                    const salt = await bcrypt.genSalt(10);
                    const hash = await bcrypt.hash(password, salt);
                    const crypto = require('crypto');
                    const token = crypto.randomBytes(32).toString('hex');

                    userModel.createUser({ login, full_name, password: hash, email, email_confirmation_token: token }, (err) => {
                        if (err) return res.status(500).send('Failed to register user.');

                        // TO-DO: Відправити email з підтвердженням
                    });
                } catch (error) {
                    console.error('Hashing error:', error);
                    return res.status(500).send('Failed to register user.');
                }
            });
        });
    } catch (error) {
        console.error('Register error:', error);
        return res.status(500).send('Server error.');
    }
};
