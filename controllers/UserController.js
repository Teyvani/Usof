const userModel = require('../models/userModel.js');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'diana.malashta17@gmail.com',
        pass: 'owma rjgp mjao rfeh'
    }
});

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
                    const token = crypto.randomBytes(32).toString('hex');

                    userModel.createUser({ login, full_name, password: hash, email, email_confirmation_token: token }, (err) => {
                        if (err) return res.status(500).send('Failed to register user.');

                        (async () => {
                            const info = await transporter.sendMail({
                                from: '"Usof" <diana.malashta17@gmail.com>',
                                to: email,
                                subject: 'Підтвердження реєстрації',
                                text: 'Для підтвердження реєстрації перейдіть за посиланням: http://localhost:3000/api/auth/confirm-email?token=' + token
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

exports.sendEmailTokenAgain = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).send('Email is required.');
    userModel.findByEmail(email, async (err, user) => {
        if (err) return res.status(500).send('Database error.');
        if (!user) return res.status(400).send('User not found.');
        if (user.email_confirmed) return res.status(400).send('Email already confirmed.');

        const token = crypto.randomBytes(32).toString('hex');
        userModel.updateUser(user.id, { email_confirmation_token: token }, (err) => {
            if (err) return res.status(500).send('Failed to set confirmation token.');

            (async () => {
                const info = await transporter.sendMail({
                    from: '"Usof" <diana.malashta17@gmail.com>',
                    to: email,
                    subject: 'Повторне повідомлення підтвердження реєстрації',
                    text: 'Для підтвердження реєстрації перейдіть за посиланням: http://localhost:3000/api/auth/confirm-email?token=' + token
                });
                console.log('Message sent: %s', info.messageId);
            })();
            return res.status(200).send('Confirmation send again');
        });
    });
};

exports.confirmEmail = async (req, res) => {
    const token = req.query.token;
    if (!token) return res.status(400).send('Token is required.');

    try {
        userModel.findByEmailToken(token, (err, user) => {
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

exports.passwordResetRequest = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).send('Email is required.');
    userModel.findByEmail(email, async (err, user) => {
        if (err) return res.status(500).send('Database error.');
        if (!user) return res.status(400).send('User not found.');
        const password_reset_token = crypto.randomBytes(32).toString('hex');
        const password_reset_token_expiration = new Date(Date.now() + 1000 * 60 * 10).toISOString().slice(0, 19).replace('T', ' '); // 10 minutes
        userModel.updateUser(user.id, { password_reset_token, password_reset_token_expiration }, (err) => {
            if (err) return res.status(500).send('Failed to set reset token.');

                (async () => {
                    const info = await transporter.sendMail({
                        from: '"Usof" <diana.malashta17@gmail.com>',
                        to: email,
                        subject: 'Підтвердження зміни пароля',
                        text: 'Увага! Цей посилання буде дійсним протягом 10 хвилин. Для підтвердження зміни пароля перейдіть за посиланням: http://localhost:3000/api/auth/reset-password?token=' + password_reset_token
                    });
                    console.log('Message sent: %s', info.messageId);
                })();
            return res.status(200).send('Password reset email sent.');
        });
    });
}

exports.passwordResetConfirm = async (req, res) => {
    const { token, password } = req.body;
    try {
        userModel.findByResetToken(token, async (err, user) => {
            if (err) return res.status(500).send('Database error.');
            if (!user) return res.status(400).send('Invalid or expired token.');

            if (Date.now() > new Date(user.password_reset_token_expiration).getTime()) {
                return res.status(400).send('Token expired.');
            }

            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);

            userModel.updateUser(user.id, {
                password: hash,
                password_reset_token: null,
                password_reset_token_expiration: null
            }, (err) => {
                if (err) return res.status(500).send('Failed to reset password.');
                return res.status(200).send('Password has been reset successfully.');
            });
        });
    } catch (error) {
        console.error('Password reset confirm error:', error);
        return res.status(500).send('Server error.');
    }
};

exports.deleteUser = async (req, res) => {
    const userId = req.params.id;
    try {
        userModel.deleteUser(userId, (err) =>{
            if (err) return res.status(500).send('Failed to delete user.');
        return res.status(200).send('User deleted successfully.');
        });
    } catch (error) {
        console.error('Delete user error:', error);
        return res.status(500).send('Server error.');
    }
};

exports.updateUserRole = async (req, res) => {
    const userId = req.params.id;
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) return res.status(400).send('Invalid role');

    try {
        userModel.findById(userId, (err, user) => {
            if (err) return res.status(500).send('Database error.');
            if (!user) return res.status(404).send('User not found.');
            userModel.updateUser(userId, { role: role }, (err) => {
                if (err) return res.status(500).send('Failed to update user role.');
                return res.status(200).send('User role updated successfully.');
            });
        });
    } catch (error) {
        console.error('Update user role error:', error);
        return res.status(500).send('Server error.');
    }
}

exports.uploadAvatar = async (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded');
    const filePath = req.file.path;
    
    try {
        userModel.updateUser(req.session.user.id, { profile_picture: filePath }, (err) => {
            if (err) return res.status(500).send('Database error.');
            if (!user) return res.status(404).send('User not found');
            res.status(200).send({ message: 'Avatar updated successfully', path: filePath });
        });
    } catch (error) {
        console.error('Upload avatar error:', error);
        return res.status(500).send('Server error.');
    }
}

exports.getAvatar = async (req, res) => {
    const userId = req.params.id;

    try {
        userModel.findById(userId, (err, user) => {
            if (err) return res.status(500).send('Database error.');
            if (!user) return res.status(404).send('User not found');
            res.status(200).send({imagePath: user.profile_picture});
        });
    } catch (error) {
        console.error('Upload avatar error:', error);
        return res.status(500).send('Server error.');
    }
}
