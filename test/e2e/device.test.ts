import { app } from '../../index';
import {
    connect,
    clearDatabase,
    closeDatabase,
    createTestUserAndAuthenticate,
} from '../util';
import supertest from 'supertest';
import { model } from 'mongoose';
import { DeviceSchema } from '../../src/model/deviceModel';
import { UserSchema } from '../../src/model/userModel';

const Device = model('Device', DeviceSchema);
const User = model('User', UserSchema);

const testPlant = {
    name: 'Teresa',
    description: 'A beautiful flower',
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

    it('01 - Device can be registered', async () => {
        const res = await supertest(app).post('/devices').send();
        expect(res.status).toEqual(200);

        expect(res.body.bindingCode).toBeDefined();
        expect(res.body.bindingToken).toBeDefined();

        const device = await Device.findOne({
            bindingCode: res.body.bindingCode,
        });

        expect(device).toBeDefined();
    });

    it('02 - Device can be bound to a plant', async () => {
        const testUser = await createTestUserAndAuthenticate(app);
        await supertest(app)
            .post('/plants')
            .set('Authorization', `Bearer ${testUser.authToken}`)
            .send(testPlant);
        const res = await supertest(app).post('/devices').send();

        const bindingCode = res.body.bindingCode;
        const user = await User.findOne({ email: testUser.email });
        if (user == null) {
            throw new Error('Test user not found');
        }

        const plant = user.plants[0];

        const bindingRes = await supertest(app)
            .post('/binding')
            .set('Authorization', `Bearer ${testUser.authToken}`)
            .send({ bindingCode: bindingCode, plantId: plant._id });

        expect(bindingRes.status).toEqual(200);

        const device = await Device.findOne({ bindingCode: bindingCode });

        if (device == null) {
            throw new Error('Device not found');
        }

        expect(device.isBound).toBe(true);
        expect(device.boundPlantId).toEqual(plant._id);
        expect(device.boundUserId).toEqual(user._id);
    });

    it('03 - Wrong binding code cannot be used to bind', async () => {
        const testUser = await createTestUserAndAuthenticate(app);

        await supertest(app)
            .post('/plants')
            .set('Authorization', `Bearer ${testUser.authToken}`)
            .send(testPlant);

        const user = await User.findOne({ email: testUser.email });
        if (user == null) {
            throw new Error('Test user not found');
        }

        const plant = user.plants[0];

        const bindingRes = await supertest(app)
            .post('/binding')
            .set('Authorization', `Bearer ${testUser.authToken}`)
            .send({ bindingCode: 123, plantId: plant._id });

        expect(bindingRes.status).toEqual(404);
    });

    it('04 - Device can retrieve measurement token after binding', async () => {
        const testUser = await createTestUserAndAuthenticate(app);
        await supertest(app)
            .post('/plants')
            .set('Authorization', `Bearer ${testUser.authToken}`)
            .send(testPlant);

        const res = await supertest(app).post('/devices').send();

        const bindingCode = res.body.bindingCode;
        const bindingToken = res.body.bindingToken;
        const user = await User.findOne({ email: testUser.email });
        if (user == null) {
            throw new Error('Test user not found');
        }

        const plant = user.plants[0];

        await supertest(app)
            .post('/binding')
            .set('Authorization', `Bearer ${testUser.authToken}`)
            .send({ bindingCode: bindingCode, plantId: plant._id });

        // At this point, the device should be successfully paired, and the measurement post token can be retreived

        const measurementTokenRes = await supertest(app)
            .post('/measurementValidation')
            .send({ bindingToken: bindingToken });

        expect(measurementTokenRes.status).toEqual(200);
        expect(measurementTokenRes.body.measurementToken).toBeDefined();
    });

    it('05 - Device cannot retrieve measurement token before being bound', async () => {
        const testUser = await createTestUserAndAuthenticate(app);
        await supertest(app)
            .post('/plants')
            .set('Authorization', `Bearer ${testUser.authToken}`)
            .send(testPlant);

        const res = await supertest(app).post('/devices').send();

        const bindingToken = res.body.bindingToken;

        const measurementTokenRes = await supertest(app)
            .post('/measurementValidation')
            .send({ bindingToken: bindingToken });

        expect(measurementTokenRes.status).toEqual(403);
        expect(measurementTokenRes.body.measurementToken).toBeUndefined();
    });
});
