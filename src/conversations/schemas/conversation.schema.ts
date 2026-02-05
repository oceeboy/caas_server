import {
  Schema,
  Document,
  Types,
} from 'mongoose';

export const ConversationSchema = new Schema(
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
    agentId: {
      type: Types.ObjectId,
      ref: 'Agent',
      required: false,
    },
    status: {
      type: String,
      enum: ['open', 'closed', 'pending'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  },
);

export interface ConversationDocument extends Document {
  orgId: Types.ObjectId;
  visitorId: Types.ObjectId;
  agentId?: Types.ObjectId;
  status: 'open' | 'closed' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}
