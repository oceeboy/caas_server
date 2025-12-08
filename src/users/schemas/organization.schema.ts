import {
  Schema,
  Document,
  Types,
} from 'mongoose';

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
  _id: Types.ObjectId;
  name: string;
  apiKey: string;
  createdAt: Date;
  updatedAt: Date;
}
