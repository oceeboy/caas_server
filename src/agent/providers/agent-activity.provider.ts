import type { Connection } from 'mongoose';
import { AgentActivitySchema } from '../schemas';

export const agentActivityProviders = [
  {
    provide: 'AGENT_ACTIVITY_MODEL',
    useFactory: (connection: Connection) =>
      connection.model(
        'AgentActivity',
        AgentActivitySchema,
      ),
    inject: ['DATABASE_CONNECTION'],
  },
];
