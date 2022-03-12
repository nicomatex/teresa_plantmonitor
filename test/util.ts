import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import supertest from 'supertest';
import type { Express } from 'express';

const mongod = MongoMemoryServer.create();

const testUserData = {
    email: 'test@test.com',
    password: '1234',
};

const testPlantData = {
    name: 'Teresa',
    description: 'A beautiful flower',
};

type TestUser = {
    authToken: string;
    email: string;
    password: string;
};

type TestPlant = {
    id: string;
};

export const connect = async () => {
    const uri = (await mongod).getUri();
    await mongoose.connect(uri);
};

export const closeDatabase = async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await (await mongod).stop();
};

export const clearDatabase = async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
    }
};

export const createTestUserAndAuthenticate = async (
    app: Express
): Promise<TestUser> => {
    await supertest(app).post('/users').send(testUserData);

    const session = await supertest(app)
        .post('/session')
        .auth(testUserData.email, testUserData.password);
    if (session.status !== 200) {
        throw new Error('Error creating test session');
    }
    return {
        authToken: session.body.access_token,
        email: testUserData.email,
        password: testUserData.password,
    };
};
