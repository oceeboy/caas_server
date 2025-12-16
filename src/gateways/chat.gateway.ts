import {
  BadGatewayException,
  Logger,
} from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

const messageLogger = new Logger('MessageLogger');

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway
  implements
    OnGatewayConnection,
    OnGatewayDisconnect
{
  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  @WebSocketServer() server: Server;

  private logger = new Logger(ChatGateway.name);

  // create a map to store connected clients
  private clients = new Map<
    string,
    {
      socket: Socket;
      userId: string;
      token: string;
    }
  >();

  private socketToUser = new Map<
    string,
    string
  >();

  private visitorDetails = new Map<string, any>();

  async connect(client: Socket) {
    // fetch token from client handshake query
    const token = client.handshake.auth.token;
    if (!token) {
      this.logger.error(
        `No token provided by client: ${client.id}`,
      );
      // if there is no token, disconnect the client
      client.disconnect();

      return;
    }
    // verify token
    try {
      const payload = this.jwtService.verify(
        token,
        {
          secret: this.configService.get<string>(
            'VISITOR_JWT_SECRET',
          ),
        },
      );
      this.logger.debug(
        `Token payload for client ${client.id}: ${JSON.stringify(
          payload,
        )}`,
      );
      this.visitorDetails.set(client.id, payload);
    } catch (error) {
      this.logger.error(
        `Error verifying token for client ${client.id}: ${error.message}`,
      );
      client.disconnect();
      return;
    }

    const userId = client.handshake.query.userId;
    if (!userId) {
      this.logger.error(
        `No userId provided by client: ${client.id}`,
      );
      return;
    }

    this.socketToUser.set(
      client.id,
      userId as string,
    );

    this.clients.set(client.id, {
      socket: client,
      userId: userId as string,
      token: token,
    });
    this.logger.debug(
      `Token from client ${client.id}: ${token}`,
    );
  }

  async disconnect(client: Socket) {
    this.socketToUser.delete(client.id);
    this.clients.delete(client.id);
    this.logger.debug(
      `Client disconnected: ${client.id}`,
    );
  }

  async handleConnection(client: Socket) {
    await this.connect(client);
    const user = this.socketToUser.get(client.id);
    this.broadcastMessage('chat.test', {
      message: `Welcome ${user}  ${client.id}!`,
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(
      `Client disconnected: ${client.id}`,
    );
    this.socketToUser.delete(client.id);
    this.clients.delete(client.id);
  }

  // send a message to all connected clients
  private broadcastMessage(
    event: string,
    message: any,
  ) {
    this.server.emit(event, message);
  }
  // send a message to a specific client
  private sendMessageToClient(
    client: Socket,
    event: string,
    message: any,
  ) {
    client.emit(event, message);
  }

  @SubscribeMessage('chat.test')
  handleTestMessage(
    client: Socket,
    payload: any,
  ) {
    const user = this.socketToUser.get(client.id);

    const clientData = this.clients.get(
      client.id,
    );

    messageLogger.log(
      `This is the user: ${user} sending a test message.`,
    );
    messageLogger.debug(
      ` test message from ${user}: ${JSON.stringify(
        payload,
      )}`,
    );
    this.sendMessageToClient(
      client,
      'chat.test',
      {
        message: `Hello from server, ${user}! ${payload.message}`,
      },
    );
  }
  // send a direct message to a specific user
  private sendDirectMessageToUser(
    userId: string,
    event: string,
    message: any,
  ) {
    const client = Array.from(
      this.clients.values(),
    ).find((client) => client.userId === userId);
    if (client) {
      this.sendMessageToClient(
        client.socket,
        event,
        message,
      );
    }
  }

  @SubscribeMessage('chat.dm.send')
  handleDirectMessage(
    client: Socket,
    payload: {
      toUserId: string;
      message: string;
    },
  ) {
    const { toUserId, message } = payload;
    const fromUserId = this.socketToUser.get(
      client.id,
    );
    if (!fromUserId) {
      this.logger.error(
        `Unknown sender for client: ${client.id}`,
      );
      return;
    }

    messageLogger.log(
      `${fromUserId} sending DM to ${payload.toUserId}: ${payload.message}`,
    );
    this.logger.debug(
      `Direct message from ${fromUserId} to ${payload.toUserId}: ${payload.message}`,
    );

    this.sendDirectMessageToUser(
      payload.toUserId,
      'chat.dm.received',
      {
        fromUserId,
        message: payload.message,
      },
    );
  }
}
