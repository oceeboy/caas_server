import {
  Schema,
  Document,
  Types,
} from 'mongoose';

export const MessageSchema = new Schema(
  {
    // Define message fields here as needed
    content: { type: String, required: true },
    // send id deals on both agent and visitor ids
    senderId: {
      type: Types.ObjectId,
      required: true,
    },
    senderType: {
      type: String,
      enum: ['agent', 'visitor'],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export interface MessageDocument
  extends Document {
  _id: Types.ObjectId;
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
