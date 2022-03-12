import { Application } from 'express';
import { authorizationMiddleware } from '../middlewares/authorizationMiddleware';
import { bindDeviceToPlant, registerDevice } from '../services/devicesService';

const routes = (app: Application) => {
    app.route('/devices').post(registerDevice);
    app.route('/binding').post(authorizationMiddleware, bindDeviceToPlant);
};

export default routes;
