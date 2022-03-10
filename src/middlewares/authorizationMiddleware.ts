import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

export const authorizationMiddleware: RequestHandler = async (
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
        ) as { userId: string };

        res.locals.userId = tokenPayload.userId;

        next();
    } catch (e) {
        res.sendStatus(401);
        return;
    }
};
