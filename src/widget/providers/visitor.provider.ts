import { Connection } from 'mongoose';
import { VisitorSchema } from '../schemas';

export const visitorProviders = [
  {
    provide: 'VISITOR_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('Visitor', VisitorSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
