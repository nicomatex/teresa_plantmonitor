import { Application } from 'express';
import { authorizationMiddleware } from '../middlewares/authorizationMiddleware';
import {
    bindDeviceToPlant,
    genMeasurementPublishCode,
    registerDevice,
} from '../services/devicesService';

const routes = (app: Application) => {
    app.route('/devices').post(registerDevice);
    app.route('/binding').post(authorizationMiddleware, bindDeviceToPlant);
    app.route('/measurementValidation').post(genMeasurementPublishCode);
};

export default routes;
