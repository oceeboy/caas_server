import { Schema } from 'mongoose';

export const ConversationSchema = new Schema(
  {
    orgId: { type: String, required: true },
    visitorId: { type: String, required: true },
    agentId: { type: String, required: false },
    status: {
      type: String,
      enum: ['open', 'closed', 'pending'],
      default: 'open',
    },
  },
  {
    timestamps: true,
  },
);
