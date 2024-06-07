import { Document } from 'mongoose';

export interface UserInterface extends Document {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
  department?: string;
  createdTime?: Date;
  updatedTime?: Date;
}

export enum Role {
  ADMIN = 'admin',
  USER = 'user',
}
