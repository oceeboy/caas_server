import { Connection } from 'mongoose';
import { OrganizationSchema } from '../schemas';

export const organizationProviders = [
  {
    provide: 'ORGANIZATION_MODEL',
    useFactory: (connection: Connection) =>
      connection.model(
        'Organization',
        OrganizationSchema,
      ),
    inject: ['DATABASE_CONNECTION'],
  },
];
