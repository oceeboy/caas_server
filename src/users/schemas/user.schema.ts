import {
  Schema,
  Document,
  Types,
} from 'mongoose';

export const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    }, // Password field for authentication not to be returned by default in queries
    orgId: {
      type: Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'agent'],
      default: 'agent',
    },
  },
  {
    timestamps: true,
  },
);

export interface UserDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string; // Password field for authentication
  orgId: Types.ObjectId;
  role: 'admin' | 'agent';
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}
