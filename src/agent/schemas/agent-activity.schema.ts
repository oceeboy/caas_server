import {
  Schema,
  Types,
  type Document,
} from 'mongoose';

export const AgentActivitySchema = new Schema(
  {
    agentId: {
      type: Types.ObjectId,
      ref: 'Agent',
      required: true,
    },
    activityType: {
      type: String, // e.g., 'login', 'logout', 'message_sent', etc.
      required: true,
    },
    details: { type: Schema.Types.Mixed }, // additional details about the activity
  },
  {
    timestamps: true,
  },
);

export interface AgentActivityDocument
  extends Document {
  _id: Types.ObjectId;
  agentId: Types.ObjectId;
  activityType: string;
  details: any;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
