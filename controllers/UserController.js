const UserModel = require('../models/UserModle.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const register = async (req, res) => {
    const {login, full_name, password, email} = req.body;
    /*BLA BLA BLA*/
};