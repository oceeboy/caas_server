import { Schema, Document } from 'mongoose';

/**
 * Widget settings schema
 * this is for future use
 * for now i'm working on basic widget settings like theme color, position, logo
 */
export const WidgetSettingsSchema = new Schema(
  {
    orgId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    primaryColor: {
      type: String,
      default: '#000000',
    }, // default black
    secondaryColor: {
      type: String,
      default: '#FFFFFF',
    }, // default white
    logo: {
      type: String,
      default: '',
    }, // default empty
    welcomeMessage: {
      type: String,
      default: 'Hi! How can we help today?',
    }, // default welcome message
    position: {
      type: String,
      enum: [
        'bottom-right',
        'bottom-left',
        'top-right',
        'top-left',
      ],
      default: 'bottom-right',
    }, // default bottom-right
  },
  {
    timestamps: true,
  },
);

export interface WidgetSettingsDocument
  extends Document {
  orgId: Schema.Types.ObjectId;
  primaryColor: string;
  secondaryColor: string;
  logo: string;
  welcomeMessage: string;
  position: string;

  createdAt: Date;
  updatedAt: Date;
}
