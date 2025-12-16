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
import { MessageService } from '../message/message.service';

const messageLogger = new Logger(
  'ChatMessageLogger',
);

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway
  implements
    OnGatewayConnection,
    OnGatewayDisconnect
{
  constructor(
    private messageService: MessageService,
    private chatService: ChatService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  @WebSocketServer() server: Server;

  // =======================================================================
  // in-app memory
  // =======================================================================

  private users = new Map<string, any>();
  // =======================================================================
  // handle client connection
  // =======================================================================

  // connection helper

  async connectClientConnectionToSoket(
    client: Socket,
  ) {
    // AUTHENTICATION
    const token = client.handshake.auth.token;
    if (!token) {
      messageLogger.error(
        `Client connection rejected: No token provided`,
      );
      await this.disconnectClientConnectionFromSocket(
        client,
      );
      return;
    }

    try {
      const payload =
        await this.jwtService.verifyAsync(token, {
          secret: this.configService.get(
            'VISITOR_JWT_SECRET',
          ),
        });
      client.data = {
        userId: payload.sub,
        role: payload.role,
        orgId: payload.orgId,
        browerId: payload.browerId,
      };

      //====! inject to server !====

      // ✅ Join rooms
      client.join(`org:${payload.orgId}`);

      if (payload.role === 'visitor') {
        client.join(`visitor:${payload.sub}`);
      }

      if (
        payload.role === 'agent' ||
        payload.role === 'admin'
      ) {
        client.join(
          `org:${payload.orgId}:agents`,
        );
        client.join(`agent:${payload.sub}`);
      }

      messageLogger.log(
        `Client connected: ${client.data.userId}`,
      );
      // emit a successful connection message to client
      client.emit('connection', {
        message: 'Authentication successful',
      });
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        messageLogger.error(
          `ERROR_MESSAGE: ${error.message} \n`,
        );

        // emit specific error message to client
        client.emit('error', {
          message: `Authentication error: ${error.message}`,
        });

        await this.disconnectClientConnectionFromSocket(
          client,
        );
        return;
      }

      await this.disconnectClientConnectionFromSocket(
        client,
      );
    }
  }

  async handleConnection(client: Socket) {
    await this.connectClientConnectionToSoket(
      client,
    );
  }

  // =======================================================================
  // handle client disconnection
  // =======================================================================
  // disconnection helper
  async disconnectClientConnectionFromSocket(
    client: Socket,
  ) {
    client.disconnect();
  }
  async handleDisconnect(client: Socket) {
    await this.disconnectClientConnectionFromSocket(
      client,
    );
  }

  // =======================================================================
  // handle incoming chat messages (testing: vistor)
  // =======================================================================
  @SubscribeMessage('chat.message.send')
  async handleChatMessage(
    client: Socket,
    payload: { text: string },
  ) {
    try {
      const userId = client.data;
      if (!userId) {
        throw new BadGatewayException(
          'User not authenticated',
        );
      }

      // log the received message
      messageLogger.log(
        `Received message from ${userId}: ${payload.text}`,
      );

      // send to user
      client.emit('chat.message.received', {
        userId,
        text: payload.text,
      });
    } catch (error) {
      messageLogger.error(
        `Error handling chat message: ${error.message}`,
      );
      client.emit('error', {
        message: `Error processing message: ${error.message}`,
      });
    }
  }
  // =======================================================================
  // private dm test from agent to visitor
  // =======================================================================

  @SubscribeMessage('chat.dm.send')
  async sendVisitorMessage(
    client: Socket,
    payload: {
      toUserId: string;
      message: string;
    },
  ) {
    const { toUserId, message } = payload;
    const user = client.data.userId;
    const role = client.data.role;

    if (role !== 'agent' && role !== 'admin') {
      return;
    }

    const savedMessage =
      await this.messageService.createAgentMessageRecord(
        {
          content: message,
          senderId: user,
        },
      );

    messageLogger.debug(
      `${user} with role ${role} sending to ${toUserId} this message ${JSON.stringify(payload)}`,
    );

    // client.emit(
    //   'chat.test',
    //   `this proves ${user} is an ${role} `,
    // );

    this.server
      .to(`visitor:${toUserId}`)
      .emit('chat.test', savedMessage);
  }

  //======================================================
  // private dm test from visitor to agent
  // ======================================================
  @SubscribeMessage('visitordm.send')
  async sendAgentMessage(
    client: Socket,
    payload: {
      toUserId: string;
      message: string;
    },
  ) {
    const { toUserId, message } = payload;
    const user = client.data.userId;
    const role = client.data.role;
    const orgId = client.data.orgId;

    if (role !== 'visitor') {
      return;
    }
    messageLogger.debug(
      `${user} with role ${role} sending to ${toUserId} this message ${JSON.stringify(payload)}`,
    );

    // this.server
    //   .to(`agent:${toUserId}`)
    //   .emit('chat.test', {
    //     message: `Direct message from visitor ${user} \n: ${message}`,
    //   });

    const savedMessage =
      await this.messageService.createVisitorMessageRecord(
        {
          content: message,
          senderId: user,
        },
      );

    this.server
      .to(`org:${orgId}:agents`)
      .emit('chat.test', savedMessage);
  }

  // =======================================================================
  // helper methods
  // =======================================================================
}
