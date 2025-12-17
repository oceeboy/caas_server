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

/**
 * Agent Schema and Document Interface
 *
 * to add later:
 *  - status: { type: String, enum: ['online', 'offline', 'busy'], default: 'offline' },
 *  - lastActive: { type: Date, default: Date.now },
 * - skills: [{ type: String }], // array of skills or tags
 * - assignedTickets: [{ type: Types.ObjectId, ref: 'Ticket' }], // reference to tickets assigned to the agent
 * - profilePicture: { type: String }, // URL to profile picture using cloudinary
 * - contactNumber: { type: String }, // optional contact number
 * - timezone: { type: String }, // agent's timezone
 * - notificationsEnabled: { type: Boolean, default: true }, // whether the agent wants to receive notifications
 */
