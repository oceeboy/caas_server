import { Schema, type Document } from 'mongoose';

export const OrganizationSchema = new Schema(
  {
    name: { type: String, required: true },
    apiKey: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true },
);
export interface OrganizationDocument
  extends Document {
  name: string;
  apiKey: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
