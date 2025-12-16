import { Connection } from 'mongoose';
import { MessageSchema } from '../schemas';

export const messageProvider = [
  {
    provide: 'MESSAGE_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('Message', MessageSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
