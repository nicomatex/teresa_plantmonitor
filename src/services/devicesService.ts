import { RequestHandler } from 'express';
import { model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import logger from '../logger';
import { DeviceSchema } from '../model/deviceModel';
import { getBindingCode } from '../util';
import jwt from 'jsonwebtoken';
import TokenType from '../security/tokenTypes';

const Device = model('Device', DeviceSchema);

export const registerDevice: RequestHandler = async (req, res) => {
    const bindingCode = getBindingCode();
    const device = new Device({
        _id: uuidv4(),
        bindingCode: bindingCode,
    });

    try {
        await device.save();
    } catch (e) {
        logger.error(`Error saving device: ${e}`);
        return res.sendStatus(500);
    }

    const token = jwt.sign(
        { bindingCode: bindingCode, tokenType: TokenType.Binding },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: process.env.TOKEN_EXPIRATION || '2h' }
    );
    res.json({ bindingCode: bindingCode, bindingToken: token });
};
