import { app } from '../../index';
import {
    connect,
    clearDatabase,
    closeDatabase,
    createTestUserAndAuthenticate,
} from '../util';
import supertest from 'supertest';
import { model } from 'mongoose';
import { PlantSchema } from '../../src/model/plantModel';

const Plant = model('Plant', PlantSchema);

const testPlant = {
    name: 'Teresa',
    description: 'A beautiful flower',
};

const anotherTestPlant = {
    name: 'Juan Pablo',
    description: 'A not so beautiful flower',
};

describe('Account CRUD Operations', () => {
    beforeAll(async () => {
        process.env.NODE_ENV = 'test';
        process.env.JWT_SECRET = 'TEST_SECRET';
        process.env.TOKEN_EXPIRATION = '2h';
        process.env.BCRYPT_SALT_ROUNDS = '8';
        process.env.BINDING_JWT_SECRET = 'TERESITA';
        process.env.BINDING_TOKEN_EXPIRATION = '2h';
        process.env.MEASUREMENT_JWT_SECRET = 'TERESARDIUM';
        process.env.MEASUREMENT_TOKEN_EXPIRATION = '1y';
        await connect();
    });

    beforeEach(async () => {
        await clearDatabase();
    });

    afterAll(async () => {
        await closeDatabase();
    });

    it('01 - User with no plants can create plant', async () => {
        const testUser = await createTestUserAndAuthenticate(app);

        const res = await supertest(app)
            .post('/plants')
            .set('Authorization', `Bearer ${testUser.authToken}`)
            .send(testPlant);
        expect(res.status).toEqual(200);

        expect(await Plant.count()).toEqual(1);

        const plant = await Plant.findOne();
        if (plant == null) {
            throw new Error('Test plant not found');
        }
        expect(plant).toBeDefined();
        expect(plant.name).toEqual(testPlant.name);
        expect(plant.description).toEqual(testPlant.description);
    });

    it('02 - User can create many plants', async () => {
        const testUser = await createTestUserAndAuthenticate(app);

        await supertest(app)
            .post('/plants')
            .set('Authorization', `Bearer ${testUser.authToken}`)
            .send(testPlant);

        const res2 = await supertest(app)
            .post('/plants')
            .set('Authorization', `Bearer ${testUser.authToken}`)
            .send(anotherTestPlant);

        expect(res2.status).toEqual(200);

        expect(await Plant.count()).toEqual(2);
    });
});
