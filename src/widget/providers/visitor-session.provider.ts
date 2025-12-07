import { Connection } from 'mongoose';
import { VisitorSessionSchema } from '../schemas';

export const visitorSessionProviders = [
  {
    provide: 'VISITOR_SESSION_MODEL',
    useFactory: (connection: Connection) =>
      connection.model(
        'VisitorSession',
        VisitorSessionSchema,
      ),
    inject: ['DATABASE_CONNECTION'],
  },
];
