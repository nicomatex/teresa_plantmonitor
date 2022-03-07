import { Application } from 'express';
import { extractCredentialsMiddleware } from '../middlewares/extractCredentialsMiddleware';
import { addNewUser, createSession } from '../services/usersService';

const routes = (app: Application) => {
    app.route('/users').post(addNewUser);
    app.route('/session').post(extractCredentialsMiddleware, createSession);
};

export default routes;
