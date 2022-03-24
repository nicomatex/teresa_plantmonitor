import { Schema } from 'mongoose';

type Measurement = {
    _id: Schema.Types.ObjectId;
    humidity: number;
    temperature: number;
    deviceId: Schema.Types.ObjectId;
    plantId: Schema.Types.ObjectId;
    receivedDate?: Date;
};

export const MeasurementSchema = new Schema<Measurement>({
    _id: {
        type: Schema.Types.ObjectId,
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
    deviceId: {
        type: Schema.Types.ObjectId,
        ref: 'Device',
        required: [true, 'Device id is required'],
    },
    plantId: {
        type: Schema.Types.ObjectId,
        ref: 'Plant',
        required: [true, 'Plant id is required'],
    },
    receivedDate: {
        type: Date,
        default: () => new Date(),
    },
});
