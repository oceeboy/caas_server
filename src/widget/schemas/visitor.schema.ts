import { Schema, Document } from 'mongoose';

export const VisitorSchema = new Schema(
  {
    orgId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    //   optional fields to store visitor info
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    ipAddress: { type: String, default: '' },
    // strict
    browserId: { type: String, required: true },
    lastSeenAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);
export interface VisitorDocument
  extends Document {
  orgId: Schema.Types.ObjectId;
  name: string;
  email: string;
  ipAddress: string;
  browserId: string;
  lastSeenAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
