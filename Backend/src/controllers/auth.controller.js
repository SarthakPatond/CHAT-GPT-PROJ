const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

function setAuthCookie(res, token) {
    res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false
    });
}

async function registerUser(req, res) {
    const { fullName: { firstName, lastName }, email, password } = req.body;

    const isUserAlreadyExists = await userModel.findOne({ email });

    if (isUserAlreadyExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
        fullName: {
            firstName,
            lastName
        },
        email,
        password: hashedPassword
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    setAuthCookie(res, token);

    return res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
            id: user._id,
            email: user.email,
            fullName: user.fullName
        }

    });
}

async function loginUser(req, res) {
    const { email, password } = req.body;
    const user = await userModel.findOne({
        email
    });
    if (!user) {
        return res.status(400).json({ message: 'Invalid email or password' });
    } 

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    setAuthCookie(res, token);

    return res.status(200).json({
        message: 'User logged in successfully',
        token,
        user: {
            id: user._id,
            email: user.email,
            fullName: user.fullName
        }
    });

}

module.exports = {
    registerUser,
    loginUser
}
