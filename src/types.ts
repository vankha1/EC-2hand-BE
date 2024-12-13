import { Types } from 'mongoose';
import { Role } from './schema';

//** Global types */
export interface TCurrentUser {
    _id: Types.ObjectId | string;
    role: Role;
}

export const unSelectedFields = {
    createdAt: 0,
    updatedAt: 0,
    isDeleted: 0,
    __v: 0,
};
