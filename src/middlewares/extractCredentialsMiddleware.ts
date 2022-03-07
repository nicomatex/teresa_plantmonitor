import { RequestHandler } from 'express';

export const extractCredentialsMiddleware: RequestHandler = async (
    req,
    res,
    next
) => {
    let encodedCredentials = req.get('authorization');
    if (!encodedCredentials)
        return res.status(401).json({ error: 'Email and password required.' });

    encodedCredentials = encodedCredentials.split(' ')[1];
    if (!encodedCredentials)
        res.status(401).json({ error: 'Email and password required.' });

    const credentials = Buffer.from(encodedCredentials, 'base64')
        .toString('ascii')
        .split(':');

    const email = credentials[0];
    const password = credentials[1];

    res.locals.email = email;
    res.locals.password = password;
    next();
};
