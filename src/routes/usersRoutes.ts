import { Application } from 'express';
import { addNewUser } from '../services/usersService';

const routes = (app: Application) => {
    app.route('/users').post(addNewUser);
};

export default routes;
