import { Connection } from 'mongoose';
import { AgentSchema } from '../schemas';

export const agentProviders = [
  {
    provide: 'AGENT_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('Agent', AgentSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
