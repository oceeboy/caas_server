import { Schema, Document } from 'mongoose';

export const VisitorSessionSchema = new Schema(
  {
    orgId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    visitorId: {
      type: Schema.Types.ObjectId,
      ref: 'Visitor',
      required: true,
    },
    ipAddress: { type: String, default: '' }, // optional to store IP address
    userAgent: { type: String, default: '' }, // optional to store user agent
    pageUrl: { type: String, default: '' }, // optional to store page URL
  },
  {
    timestamps: true,
  },
);

export interface VisitorSessionDocument
  extends Document {
  orgId: Schema.Types.ObjectId;
  visitorId: Schema.Types.ObjectId;
  ipAddress: string;
  userAgent: string;
  pageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}
