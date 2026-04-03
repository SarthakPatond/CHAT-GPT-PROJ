const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');

function getTokenFromRequest(req) {
    const cookieToken = req.cookies?.token;
    if (cookieToken) return cookieToken;

    const authHeader = req.headers.authorization || '';
    if (authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7);
    }

    return null;
}

async function authUser(req, res, next) {
    const token = getTokenFromRequest(req);

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        req.user = user;
        next(); 

    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
}

module.exports = {
    authUser
};
