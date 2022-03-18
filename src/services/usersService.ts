import { RequestHandler } from 'express';
import { model } from 'mongoose';
import { UserSchema } from '../model/userModel';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import logger from '../logger';
import jwt from 'jsonwebtoken';
import { MongoServerError } from 'mongodb';
import { TokenType } from '../security/tokenTypes';

const User = model('User', UserSchema);

export const addNewUser: RequestHandler = async (req, res) => {
    if (!req.body.email || !req.body.password) {
        return res
            .status(400)
            .json({ error: 'Email and password are required' });
    }
    try {
        const salt_rounds = process.env.BCRYPT_SALT_ROUNDS
            ? parseInt(process.env.BCRYPT_SALT_ROUNDS)
            : 10;
        const hashedPassword = await bcrypt.hash(
            req.body.password,
            salt_rounds
        );
        const newUser = new User({
            _id: uuidv4(),
            email: req.body.email,
            password: hashedPassword,
        });
        await newUser.save();
    } catch (error) {
        if (error instanceof MongoServerError) {
            if (error.code === 11000) {
                return res.status(409).json({
                    error: 'An account with that email already exists',
                });
            }
        }
        logger.warn(`Error creating user: ${error}`);

        return res
            .status(500)
            .json({ error: 'Unexpected error creating user' });
    }
    res.sendStatus(200);
};

export const createSession: RequestHandler = async (req, res) => {
    const user = await User.findOne({ email: res.locals.email });
    if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const passwordMatches = await bcrypt.compare(
        res.locals.password,
        user.password
    );
    if (!passwordMatches) {
        return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
        { userId: user._id, tokenType: TokenType.Session },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: process.env.TOKEN_EXPIRATION || '2h' }
    );

    return res.json({ access_token: token });
};
