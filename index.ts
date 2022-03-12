import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import logger from './src/logger/';
import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/.env' });

// Middlewares
import { databaseCheckMiddleware } from './src/middlewares/databaseCheckMiddleware';

//Routes
import usersRoutes from './src/routes/usersRoutes';
import plantsRoutes from './src/routes/plantsRoutes';
import devicesRoutes from './src/routes/deviceRoutes';

const DB_URI = process.env.MONGODB_URI;

mongoose.Promise = global.Promise;

if (process.env.NODE_ENV !== 'test') {
    mongoose
        .connect(DB_URI ?? 'mongodb://localhost/test')
        .then(() => logger.info('Successfully connected to database.'))
        .catch((error) =>
            logger.error(`Error connecting to database: ${error}`)
        );
}

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(databaseCheckMiddleware);

// Register routes
usersRoutes(app);
plantsRoutes(app);
devicesRoutes(app);

const port = process.env.PORT || 3000;

app.get('/health', (req, res) => {
    res.send(`Service online. Environment: ${process.env.NODE_ENV}`);
});

if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        logger.info(`Server listening on port ${port}`);
    });
}

export { app };
