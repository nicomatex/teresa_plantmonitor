import { RequestHandler } from 'express';
import mongoose from 'mongoose';
import { model } from 'mongoose';
import logger from '../logger';
import { PlantSchema } from '../model/plantModel';

const Plant = model('Plant', PlantSchema);

export const addNewPlant: RequestHandler = async (req, res) => {
    if (!req.body.name || !req.body.description) {
        return res
            .status(400)
            .json({ error: 'Name and description are required' });
    }

    const plant = new Plant({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        description: req.body.description,
        ownerUser: res.locals.userId,
    });

    try {
        await plant.save();
    } catch (e) {
        logger.warn(`Error creating plant: ${e}`);

        return res
            .status(500)
            .json({ error: 'Unexpected error creating plant' });
    }

    res.sendStatus(200);
};

export const listMyPlants: RequestHandler = async (req, res) => {
    const plants = await Plant.find({ ownerUser: res.locals.userId });
    res.status(200).json(plants);
};
