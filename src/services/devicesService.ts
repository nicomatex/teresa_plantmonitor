import { RequestHandler } from 'express';
import { model } from 'mongoose';
import logger from '../logger';
import { DeviceSchema } from '../model/deviceModel';
import { getBindingCode } from '../util';
import jwt from 'jsonwebtoken';
import { BindingTokenPayload, TokenType } from '../security/tokenTypes';
import mongoose from 'mongoose';
import { PlantSchema } from '../model/plantModel';
import { MeasurementSchema } from '../model/measurementModel';

const Device = model('Device', DeviceSchema);
const Plant = model('Plant', PlantSchema);
const Measurement = model('Measurement', MeasurementSchema);

export const registerDevice: RequestHandler = async (req, res) => {
    const bindingCode = getBindingCode();
    const device = new Device({
        _id: new mongoose.Types.ObjectId(),
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
            .json({ error: 'Binding code and plant id are required' });
    }

    const plant = await Plant.findOne({ _id: req.body.plantId });
    if (plant == null) {
        return res.status(404).json({ error: 'Plant not found' });
    }
    if (plant.ownerUser != res.locals.userId) {
        return res
            .sendStatus(401)
            .json({ error: 'Plant does not belong to this user' });
    }

    const device = await Device.findOne({ bindingCode: req.body.bindingCode });

    if (device == null) {
        return res.status(404).json({ error: 'Binding code is not valid.' });
    }

    if (device.isBound) {
        return res
            .status(400)
            .json({ error: 'Device is already bound to a plant' });
    }

    device.boundPlantId = req.body.plantId;
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
        const decodedToken = jwt.verify(
            bindingToken,
            process.env.BINDING_JWT_SECRET || 'secret'
        ) as BindingTokenPayload;

        if (decodedToken.tokenType !== TokenType.Binding) {
            return res
                .status(400)
                .json({ error: 'Binding token is not valid.' });
        }

        const device = await Device.findOne({
            bindingCode: decodedToken.bindingCode,
        });

        if (device == null) {
            logger.error(
                `Device with binding code ${decodedToken.bindingCode} included in token not found`
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
                deviceId: device._id,
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

export const addMeasurement: RequestHandler = async (req, res) => {
    const deviceId = res.locals.deviceId;
    const plantId = res.locals.plantId;

    const measurement = new Measurement({
        _id: new mongoose.Types.ObjectId(),
        humidity: req.body.humidity,
        temperature: req.body.temperature,
        deviceId: deviceId,
        plantId: plantId,
    });

    try {
        await measurement.save();
    } catch (e) {
        logger.error(`Error saving measurement: ${e}`);
        return res.sendStatus(500);
    }
    res.sendStatus(200);
};
