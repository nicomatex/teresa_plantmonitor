import { Application } from 'express';
import { authorizationMiddleware } from '../middlewares/authorizationMiddleware';
import { addNewPlant, listMyPlants } from '../services/plantsService';

const routes = (app: Application) => {
    app.route('/plants')
        .post(authorizationMiddleware, addNewPlant)
        .get(authorizationMiddleware, listMyPlants);
};

export default routes;
