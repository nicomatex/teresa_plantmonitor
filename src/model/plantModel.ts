import { Schema } from 'mongoose';

type Plant = {
    _id: Schema.Types.ObjectId;
    name: string;
    description: string;
    ownerUser: Schema.Types.ObjectId;
    createdDate?: Date;
};

export const PlantSchema = new Schema<Plant>({
    _id: {
        type: Schema.Types.ObjectId,
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
    ownerUser: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User id is required'],
    },
    createdDate: {
        type: Date,
        default: () => new Date(),
    },
});
