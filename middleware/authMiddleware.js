const jwt = require('jsonwebtoken');
const HttpError = require('../models/errorModel');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader && !authHeader.startsWith('Bearer ')) {
            const token = Authorization.split(' ')[1];
            jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
                if (err) {
                    return next(new HttpError('Unauthorized access. Invalid token.', 403));
                } 

                req.user = info;
                next();
            });
        } else {
            return next(new HttpError('Unauthorized access. No token provided.', 403));
        }
    } catch (error) {
        return next(new HttpError('Authentication failed, please log in again.', 401));
    }
};