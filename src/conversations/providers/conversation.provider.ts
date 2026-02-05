import type { Connection } from 'mongoose';
import { ConversationSchema } from '../schemas';

export const conversationProviders = [
  {
    provide: 'CONVERSATION_MODEL',
    useFactory: (connection: Connection) =>
      connection.model(
        'Conversation',
        ConversationSchema,
      ),
    inject: ['DATABASE_CONNECTION'],
  },
];
