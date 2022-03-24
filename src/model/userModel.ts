import { Schema } from 'mongoose';

type User = {
    _id: Schema.Types.ObjectId;
    email: string;
    password: string;
    createdDate: Date;
};

export const UserSchema = new Schema<User>({
    _id: {
        type: Schema.Types.ObjectId,
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
    createdDate: {
        type: Date,
        default: () => new Date(),
    },
});
