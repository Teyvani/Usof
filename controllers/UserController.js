const userModel = require('../models/userModel.js');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const session = require('express-session');

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

                        const transponter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                user: 'diana.malashta17@gmail.com',
                                pass: 'owma rjgp mjao rfeh'
                            }
                        });

                        (async () => {
                            const info = await transponter.sendMail({
                                from: '"Usof" <diana.malashta17@gmail.com>',
                                to: email,
                                subject: 'Підтвердження реєстрації',
                                text: 'Для підтвердження реєстрації перейдіть за посиланням: http://localhost:3000/confirm-email?token=' + token
                            });
                            console.log('Message sent: %s', info.messageId);
                        })();

                        return res.status(201).send('User registered. Please confirm your email.');
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

exports.confirmEmail = async (req, res) => {
    const token = req.query.token;
    if (!token) return res.status(400).send('Token is required.');

    try {
        userModel.findByToken(token, (err, user) => {
            if (err) return res.status(500).send('Database error.');
            if (!user) return res.status(400).send('Invalid token or email already confirmed.');

            userModel.updateUser(user.id, { email_confirmed: true, email_confirmation_token: null }, (err) => {
                if (err) return res.status(500).send('Failed to confirm email.');
                return res.status(200).send('Email confirmed successfully.');
            });
        });
    } catch (error) {
        console.error('Confirm email error:', error);
        return res.status(500).send('Server error.');
    }
};

exports.login = (req, res) => {
    const { login, email, password } = req.body;
    const findUser = login ? userModel.findByLogin : userModel.findByEmail;
    const identifier = login || email;

    findUser(identifier, async (err, user) => {
        if (err) return res.status(500).send('Database error.');
        if (!user) return res.status(400).send('User not found.');
        
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(400).send('Invalid password.');
        if (!user.email_confirmed) return res.status(400).send('Email not confirmed. Please confirm your email.');

        req.session.user = {
            id: user.id,
            login: user.login,
            full_name: user.full_name,
            role: user.role
        };

        res.status(200).send({message: 'Login successful', user: req.session.user});
    });
}

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).send('Failed to logout.');
        res.status(200).send('Logout successful.');
    });
}