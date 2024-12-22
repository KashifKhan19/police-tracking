const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = mongoose.model('PolicePersonal');
const { jwtKey } = require('../keys');

module.exports = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(401).send({ error: 'Token is missing.' });
    }

    const token = authorization.replace('Bearer ', '');

    try {
        const payload = jwt.verify(token, jwtKey);
        const { userId } = payload;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(401).send({ error: 'User not found.' });
        }

        req.user = user;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(403).send({ error: 'Token has expired.' });
        } else if (err.name === 'JsonWebTokenError') {
            return res.status(403).send({ error: 'Invalid token.' });
        } else {
            console.error('Error verifying token:', err);
            return res.status(500).send({ error: 'Internal server error.' });
        }
    }
};
