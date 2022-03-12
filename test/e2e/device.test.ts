import { app } from '../../index';
import { connect, clearDatabase, closeDatabase } from '../util';
import supertest from 'supertest';
import { model } from 'mongoose';
import { DeviceSchema } from '../../src/model/deviceModel';

const Device = model('Device', DeviceSchema);

describe('Account CRUD Operations', () => {
    beforeAll(async () => {
        process.env.NODE_ENV = 'test';
        process.env.JWT_SECRET = 'TEST_SECRET';
        process.env.TOKEN_EXPIRATION = '2h';
        process.env.BCRYPT_SALT_ROUNDS = '8';

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
});
