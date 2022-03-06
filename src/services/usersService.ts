import { RequestHandler } from 'express';
import { model } from 'mongoose';
import { UserSchema } from '../model/userModel';
import { v4 as uuidv4 } from 'uuid';

const User = model('User', UserSchema);

export const addNewUser: RequestHandler = async (req, res) => {
    if (!req.body.email || !req.body.password) {
        return res
            .status(400)
            .json({ error: 'Email and password are required' });
    }
    const newUser = new User({
        _id: uuidv4(),
        email: req.body.email,
        password: req.body.password,
    });
    try {
        await newUser.save();
    } catch (error) {
        return res.status(500).json({ error: error });
    }
    res.sendStatus(200);
};
