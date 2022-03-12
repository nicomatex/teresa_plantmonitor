import { Schema } from 'mongoose';

type Device = {
    _id: string;
    bindingCode: number;
    isBound: boolean;
    boundUserId: string;
    boundPlantId: string;
    registeredDate?: Date;
};

export const DeviceSchema = new Schema<Device>({
    _id: {
        type: String,
        required: [true, 'Device id is required'],
    },
    bindingCode: {
        type: Number,
        required: false,
        unique: true,
    },
    isBound: {
        type: Boolean,
        required: true,
        default: false,
    },
    boundUserId: {
        type: String,
        required: false,
    },
    boundPlantId: {
        type: String,
        required: false,
    },
    registeredDate: {
        type: Date,
        required: true,
        default: () => new Date(),
    },
});
