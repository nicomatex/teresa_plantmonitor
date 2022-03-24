import { Schema } from 'mongoose';

type Device = {
    _id: Schema.Types.ObjectId;
    bindingCode: number;
    isBound: boolean;
    boundPlantId: Schema.Types.ObjectId;
    registeredDate?: Date;
};

export const DeviceSchema = new Schema<Device>({
    _id: {
        type: Schema.Types.ObjectId,
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
    boundPlantId: {
        type: Schema.Types.ObjectId,
        ref: 'Plant',
        required: false,
    },
    registeredDate: {
        type: Date,
        required: true,
        default: () => new Date(),
    },
});
