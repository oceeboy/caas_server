import { Connection } from 'mongoose';
import { AgentSessionSchema } from '../schemas';

export const agentSessionProviders = [
  {
    provide: 'AGENT_SESSION_MODEL',
    useFactory: (connection: Connection) =>
      connection.model(
        'AgentSession',
        AgentSessionSchema,
      ),
    inject: ['DATABASE_CONNECTION'],
  },
];
