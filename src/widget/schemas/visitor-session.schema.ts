import {
  Schema,
  Document,
  Types,
} from 'mongoose';

export const VisitorSessionSchema = new Schema(
  {
    orgId: {
      type: Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    visitorId: {
      type: Types.ObjectId,
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
  _id: Types.ObjectId;
  orgId: Types.ObjectId;
  visitorId: Types.ObjectId;
  ipAddress: string;
  userAgent: string;
  pageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}
