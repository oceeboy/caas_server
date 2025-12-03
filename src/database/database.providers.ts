import * as mongoose from 'mongoose';
import { Logger } from '@nestjs/common';

export const DATABASE_CONNECTION =
  'DATABASE_CONNECTION' as const;

const logger = new Logger('Mongoose');

function getMongoUri(): string {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error(
      'MONGO_URI is not set. Example: mongodb://root:password@localhost:27017/caas?authSource=admin',
    );
  }
  // Use module-level logger (no `this` in this scope)
  try {
    const u = new URL(uri);
    logger.debug(
      `MONGO_URI ok -> ${u.hostname}:${u.port || '27017'}/${u.pathname.replace(
        '/',
        '',
      )}`,
    );
  } catch {
    logger.debug('MONGO_URI found');
  }
  return uri;
}

async function connectWithRetry(
  attempt = 1,
): Promise<typeof mongoose> {
  // Reuse existing connection if already established
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  const maxRetries = Number(
    process.env.MONGO_MAX_RETRIES ?? 10,
  );
  const retryDelayMs = Number(
    process.env.MONGO_RETRY_DELAY_MS ?? 3000,
  );
  const isProd =
    process.env.NODE_ENV === 'production';
  // Mongoose connection options
  const options: mongoose.ConnectOptions = {
    dbName:
      process.env.MONGO_DB_NAME || undefined,
    autoIndex: !isProd,
    maxPoolSize: Number(
      process.env.MONGO_MAX_POOL_SIZE ?? 10,
    ),
    minPoolSize: Number(
      process.env.MONGO_MIN_POOL_SIZE ?? 0,
    ),
    serverSelectionTimeoutMS: Number(
      process.env
        .MONGO_SERVER_SELECTION_TIMEOUT_MS ??
        5000,
    ),
    socketTimeoutMS: Number(
      process.env.MONGO_SOCKET_TIMEOUT_MS ??
        45000,
    ),
  };

  try {
    mongoose.set('strictQuery', true);
    const uri = getMongoUri();
    const conn = await mongoose.connect(
      uri,
      options,
    );

    try {
      const u = new URL(uri);
      logger.log(
        `Connected to MongoDB at ${u.hostname}:${u.port || '27017'}/${
          conn.connection.db?.databaseName ?? ''
        }`,
      );
    } catch {
      logger.log('Connected to MongoDB');
    }

    mongoose.connection.on('disconnected', () =>
      logger.warn('MongoDB disconnected'),
    );
    mongoose.connection.on('reconnected', () =>
      logger.log('MongoDB reconnected'),
    );
    mongoose.connection.on('error', (err) =>
      logger.error(
        `MongoDB error: ${err?.message}`,
        err?.stack,
      ),
    );

    return conn;
  } catch (err: any) {
    const msg = `MongoDB connection attempt ${attempt} failed: ${err?.message}`;
    if (attempt >= maxRetries) {
      logger.error(
        `${msg}. Giving up after ${maxRetries} attempts.`,
      );
      throw err;
    }
    logger.warn(
      `${msg}. Retrying in ${retryDelayMs}ms...`,
    );
    await new Promise((res) =>
      setTimeout(res, retryDelayMs),
    );
    return connectWithRetry(attempt + 1);
  }
}

export const databaseProviders = [
  {
    provide: DATABASE_CONNECTION,
    useFactory: async (): Promise<
      typeof mongoose
    > => connectWithRetry(),
  },
];
