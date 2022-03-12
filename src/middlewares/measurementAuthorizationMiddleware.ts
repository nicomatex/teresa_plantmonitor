import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import TokenType from '../security/tokenTypes';

export const measurementAuthorizationMiddleware: RequestHandler = async (
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
            process.env.JWT_SECRET || 'secret'
        ) as { userId: string; plantId: string; tokenType: TokenType };

        if (tokenPayload.tokenType !== TokenType.Plant) {
            res.status(401).json({ error: 'Invalid token type.' });
        }
        res.locals.userId = tokenPayload.userId;
        res.locals.plantId = tokenPayload.plantId;

        next();
    } catch (e) {
        res.sendStatus(401);
        return;
    }
};
