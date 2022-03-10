import { Schema } from 'mongoose';

type Measurement = {
    _id: string;
    humidity: number;
    temperature: number;
    received_date?: Date;
};

type Plant = {
    _id: string;
    name: string;
    description: string;
    measurements?: Measurement[];
    created_date?: Date;
};

type User = {
    _id: string;
    email: string;
    password: string;
    plants: Plant[];
    created_date: Date;
};

const MeasurementSchema = new Schema<Measurement>({
    _id: {
        type: String,
        required: [true, 'User id is required'],
    },
    humidity: {
        type: Number,
        required: [true, 'Humidity is required'],
    },
    temperature: {
        type: Number,
        required: [true, 'Temperature is required'],
    },
    received_date: {
        type: Date,
        default: () => new Date(),
    },
});

const PlantSchema = new Schema<Plant>({
    _id: {
        type: String,
        required: [true, 'User id is required'],
    },
    name: {
        type: String,
        required: [true, 'User id is required'],
    },
    description: {
        type: String,
        required: [true, 'User id is required'],
    },
    measurements: {
        type: [MeasurementSchema],
        default: () => [],
    },
    created_date: {
        type: Date,
        default: () => new Date(),
    },
});

export const UserSchema = new Schema<User>({
    _id: {
        type: String,
        required: [true, 'User id is required'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    plants: {
        type: [PlantSchema],
        default: () => [],
    },
    created_date: {
        type: Date,
        default: () => new Date(),
    },
});
