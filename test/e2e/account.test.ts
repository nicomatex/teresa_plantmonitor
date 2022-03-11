import { app } from '../../index';
import { connect, clearDatabase, closeDatabase } from '../util';
import supertest from 'supertest';
import { model } from 'mongoose';
import { UserSchema } from '../../src/model/userModel';

const User = model('User', UserSchema);

const testUserData = {
    email: 'test@test.com',
    password: '1234',
};

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

    it('01 - User can create account', async () => {
        const res = await supertest(app).post('/users').send(testUserData);
        expect(res.status).toEqual(200);

        const user = await User.findOne({ email: testUserData.email });
        expect(user).toBeTruthy();

        const allUsers = await User.find();
        expect(allUsers.length).toEqual(1);
    });

    it('02 - User cannot create account if username exists', async () => {
        await supertest(app).post('/users').send(testUserData);

        const res = await supertest(app).post('/users').send(testUserData);

        expect(res.status).toEqual(409);
        const allUsers = await User.find();
        expect(allUsers.length).toEqual(1);
    });

    it('03 - Session creation with right credentials', async () => {
        await supertest(app).post('/users').send(testUserData);
        const res = await supertest(app)
            .post('/session')
            .auth(testUserData.email, testUserData.password);
        expect(res.status).toEqual(200);
        expect(res.body.access_token).toBeTruthy();
    });

    it('04 - Session creation with wrong credentials', async () => {
        await supertest(app).post('/users').send(testUserData);
        const res = await supertest(app)
            .post('/session')
            .auth('wrong', 'credentials');
        expect(res.status).toEqual(401);
        expect(res.body.access_token).toBeFalsy();
    });
});
