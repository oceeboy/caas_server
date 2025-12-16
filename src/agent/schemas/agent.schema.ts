import {
  Schema,
  Document,
  Types,
} from 'mongoose';

export const AgentSchema = new Schema(
  {
    agentName: { type: String, required: true },
    agentEmail: {
      type: String,
      required: true,
      unique: true,
    },
    handleBy: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
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

export interface AgentDocument extends Document {
  _id: Types.ObjectId;
  agentName: string;
  agentEmail: string;
  handleBy: Types.ObjectId;
  orgId: Types.ObjectId;
  role: 'admin' | 'agent';

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
