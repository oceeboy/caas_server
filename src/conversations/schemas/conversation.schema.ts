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
    }, // agentId is optional because a conversation may start without an assigned agent multiple agents can join a conversation, but for simplicity we will track only the primary agent in this field. We can extend this in the future to support multiple agents if needed.
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
