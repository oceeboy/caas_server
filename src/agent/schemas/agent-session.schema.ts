import {
  Schema,
  Document,
  Types,
} from 'mongoose';

export const AgentSessionSchema = new Schema(
  {
    agentId: {
      type: Types.ObjectId,
      ref: 'Agent',
      required: true,
    },
    orgId: {
      type: Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    ipAddress: { type: String, default: '' }, // optional to store IP address
    userAgent: { type: String, default: '' }, // optional to store user agent
  },
  { timestamps: true },
);

export interface AgentSessionDocument
  extends Document {
  _id: Types.ObjectId;
  agentId: Types.ObjectId;
  orgId: Types.ObjectId;
  ipAddress: string;
  userAgent: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
