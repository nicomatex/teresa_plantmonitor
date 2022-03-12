import { Application } from 'express';
import { registerDevice } from '../services/devicesService';

const routes = (app: Application) => {
    app.route('/devices').post(registerDevice);
};

export default routes;
