import { Application } from 'express';
import { authorizationMiddleware } from '../middlewares/authorizationMiddleware';
import { measurementAuthMiddleware } from '../middlewares/measurementAuthMiddleware';
import {
    addMeasurement,
    bindDeviceToPlant,
    genMeasurementPublishCode,
    registerDevice,
} from '../services/devicesService';

const routes = (app: Application) => {
    app.route('/devices').post(registerDevice);
    app.route('/binding').post(authorizationMiddleware, bindDeviceToPlant);
    app.route('/measurementValidation').post(genMeasurementPublishCode);
    app.route('/measurement').post(measurementAuthMiddleware, addMeasurement);
};

export default routes;
