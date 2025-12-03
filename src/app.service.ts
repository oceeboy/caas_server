import { Injectable, Logger } from '@nestjs/common';
import { trace } from 'console';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  getHello(): string {
    const id = 42;
    this.logger.debug('Hello World!'); // Log the message
    this.logger.log(`Fetching user with id ${id}`);
    this.logger.warn(`Slow query detected`);
    // this.logger.error(`User not found: ${id}`, trace('Stack trace here')); // Example with stack trace
    this.logger.verbose(`Detailed logging for user: ${id}`);
    return 'Hello World!';
  }
}
