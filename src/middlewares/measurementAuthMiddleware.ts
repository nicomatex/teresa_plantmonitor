import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { MeasurementTokenPayload, TokenType } from '../security/tokenTypes';

export const measurementAuthMiddleware: RequestHandler = async (
    req,
    res,
    next
) => {
    const authHeader = req.headers.authorization;
    if (
        authHeader === undefined ||
        authHeader === null ||
        !authHeader.startsWith('Bearer ')
    ) {
        res.sendStatus(401);
        return;
    }
    const token = authHeader.substring(7, authHeader.length);
    try {
        const tokenPayload = jwt.verify(
            token,
            process.env.MEASUREMENT_JWT_SECRET || 'secret'
        ) as MeasurementTokenPayload;

        if (tokenPayload.tokenType !== TokenType.Measurement) {
            res.status(401).json({ error: 'Invalid token type.' });
        }
        res.locals.userId = tokenPayload.userId;
        res.locals.plantId = tokenPayload.plantId;

        next();
    } catch (e) {
        console.log(e);
        res.sendStatus(401);
        return;
    }
};
