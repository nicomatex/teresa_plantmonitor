import { RequestHandler } from 'express';
import mongoose from 'mongoose';
import logger from '../logger';

export const databaseCheckMiddleware: RequestHandler = (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        logger.warn('Received a request, but the database is not connected.');
        res.status(500).json({ error: 'Database not connected.' });
        return;
    }
    next();
};
