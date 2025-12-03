import { Schema, Document } from 'mongoose';

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
      type: Schema.Types.ObjectId,
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
  name: string;
  email: string;
  password: string; // Password field for authentication
  orgId: Schema.Types.ObjectId;
  role: 'admin' | 'agent';
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}
