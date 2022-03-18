import { RequestHandler } from 'express';
import { model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import logger from '../logger';
import { DeviceSchema } from '../model/deviceModel';
import { getBindingCode } from '../util';
import jwt from 'jsonwebtoken';
import { BindingTokenPayload, TokenType } from '../security/tokenTypes';
import { UserSchema } from '../model/userModel';

const Device = model('Device', DeviceSchema);
const User = model('User', UserSchema);

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
        process.env.BINDING_JWT_SECRET || 'secret',
        { expiresIn: process.env.BINDING_TOKEN_EXPIRATION || '2h' }
    );
    res.json({ bindingCode: bindingCode, bindingToken: token });
};

export const bindDeviceToPlant: RequestHandler = async (req, res) => {
    if (!req.body.bindingCode || !req.body.plantId) {
        return res
            .status(400)
            .json({ error: 'Binding token and plant id are required' });
    }

    const user = await User.findOne({ _id: res.locals.userId }, { plants: 1 });

    if (user == null) {
        logger.error(`User ${res.locals.userId} not found`);
        return res.sendStatus(500);
    }

    const plant = user.plants.find((p) => p._id === req.body.plantId);
    if (plant == null) {
        return res.status(404).json({ error: 'Plant not found' });
    }

    const device = await Device.findOne({ bindingCode: req.body.bindingCode });

    if (device == null) {
        return res.status(404).json({ error: 'Binding code is not valid.' });
    }

    if (device.isBound) {
        return res
            .status(400)
            .json({ error: 'Device is already bound to a plant.' });
    }

    device.boundPlantId = plant._id;
    device.boundUserId = user._id;
    device.isBound = true;
    await device.save();
    res.sendStatus(200);
};

export const genMeasurementPublishCode: RequestHandler = async (req, res) => {
    if (!req.body.bindingToken) {
        return res.status(400).json({ error: 'Binding token is required' });
    }

    const { bindingToken } = req.body as { bindingToken: string };

    try {
        const decoded = jwt.verify(
            bindingToken,
            process.env.BINDING_JWT_SECRET || 'secret'
        ) as BindingTokenPayload;

        if (decoded.tokenType !== TokenType.Binding) {
            return res
                .status(400)
                .json({ error: 'Binding token is not valid.' });
        }

        const device = await Device.findOne({
            bindingCode: decoded.bindingCode,
        });

        if (device == null) {
            logger.error(
                `Device with binding code ${decoded.bindingCode} included in token not found`
            );
            return res.status(500).json({ error: 'Something went wrong.' });
        }

        if (!device.isBound) {
            return res
                .status(403)
                .json({ error: 'Device is not bound to a plant.' });
        }

        const token = jwt.sign(
            {
                userId: device.boundUserId,
                plantId: device.boundPlantId,
                tokenType: TokenType.Measurement,
            },
            process.env.MEASUREMENT_JWT_SECRET || 'secret',
            { expiresIn: process.env.MEASUREMENT_TOKEN_EXPIRATION || '2h' }
        );

        res.json({ measurementToken: token });
    } catch (e) {
        return res.status(401).json({ error: 'Invalid binding token' });
    }
};
