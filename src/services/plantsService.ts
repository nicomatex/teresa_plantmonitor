import { RequestHandler } from 'express';
import { model } from 'mongoose';
import { UserSchema } from '../model/userModel';
import { v4 as uuidv4 } from 'uuid';
import logger from '../logger';

const User = model('User', UserSchema);

export const addNewPlant: RequestHandler = async (req, res) => {
    if (!req.body.name || !req.body.description) {
        res.status(400).json({ error: 'Name and description are required' });
    }
    const new_plant = {
        _id: uuidv4(),
        name: req.body.name,
        description: req.body.description,
    };
    const user = await User.findOne({ _id: res.locals.userId });

    if (user == null) {
        logger.error(`User ${res.locals.userId} not found`);
        return res.sendStatus(500);
    }

    user.plants.push(new_plant);

    try {
        await user.save();
        res.sendStatus(200);
    } catch (error) {
        logger.warn(`Error saving plant: ${error}`);
    }
};

export const listMyPlants: RequestHandler = async (req, res) => {
    const user = await User.findOne({ _id: res.locals.userId }, { plants: 1 });

    if (user == null) {
        logger.error(`User ${res.locals.userId} not found`);
        return res.sendStatus(500);
    }

    res.status(200).json(user.plants);
};

// export const logMeasurement: RequestHandler = async (req, res) => {
//     if (!req.body.humidity || !req.body.temperature) {
//         res.status(400).json({
//             error: 'Humidity and temperature are required',
//         });
//     }
//     const measurement = {
//         _id: uuidv4(),
//         humidity: req.body.humidity,
//         temperature: req.body.temperature,
//     };

//     const user = await User.findOne({ _id: res.locals.userId });

//     if (user == null) {
//         logger.error(`User ${res.locals.userId} not found`);
//         return res.sendStatus(500);
//     }

//     const plant = user.plants.find((p) => p._id === req.params.id);

//     if (plant == null) {
//         logger.error(`Plant ${req.params.id} not found`);
//         return res.sendStatus(500);
//     }

//     plant.measurements.push(measurement);

//     try {
//         await user.save();
//         res.sendStatus(200);
//     } catch (error) {
//         logger.warn(`Error saving measurement: ${error}`);
//     }
// };
