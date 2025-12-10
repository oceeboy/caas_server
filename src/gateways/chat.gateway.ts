/**
 * ####### VERSION_1 ####
 * this is to test a connection between two people and a group
 * ####### VERSION_2 ####
 * proper name convention and structure
 */

import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatEvents } from './chat.events';
import {
  JoinRoomDto,
  SendDirectMessageDto,
  SendRoomMessageDto,
} from './dtos/chat.dto';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway
  implements
    OnGatewayConnection,
    OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  // Keep simple in-memory maps
  private userToSocket = new Map<
    string,
    string
  >();
  private socketToUser = new Map<
    string,
    string
  >();

  async onConnect(client: Socket) {
    const userId = String(
      client.handshake.query.userId || '',
    );
    if (userId) {
      this.userToSocket.set(userId, client.id);
      this.socketToUser.set(client.id, userId);
    }
  }

  async handleConnection(client: Socket) {
    // Delegate to new name for consistency
    await this.onConnect(client);
  }

  onDisconnect(client: Socket) {
    const userId = this.socketToUser.get(
      client.id,
    );
    if (userId) {
      this.userToSocket.delete(userId);
      this.socketToUser.delete(client.id);
    }
  }

  handleDisconnect(client: Socket) {
    // Delegate to new name for consistency
    this.onDisconnect(client);
  }

  // Join a two-person room using a deterministic roomId
  @SubscribeMessage(ChatEvents.RoomJoin)
  joinRoom(client: Socket, payload: JoinRoomDto) {
    const { me, peer } = payload;
    if (!me || !peer) return;
    const roomId = this.buildRoomId(me, peer);

    for (const room of client.rooms) {
      if (room !== client.id) client.leave(room);
    }

    client.join(roomId);
    client.emit(ChatEvents.RoomJoined, {
      roomId,
    });
  }

  // Broadcast message to the two-person room
  @SubscribeMessage(ChatEvents.MessageSend)
  sendRoomMessage(
    client: Socket,
    payload: SendRoomMessageDto,
  ) {
    const { roomId, to, text } = payload;
    if (!text) return;

    const sender =
      this.socketToUser.get(client.id) ||
      client.id;

    if (roomId) {
      this.server
        .to(roomId)
        .emit(ChatEvents.MessageReceived, {
          from: sender,
          text,
          roomId,
          at: Date.now(),
        });
      return;
    }

    const fromUser = this.socketToUser.get(
      client.id,
    );
    if (fromUser && to) {
      const rid = this.buildRoomId(fromUser, to);
      this.server
        .to(rid)
        .emit(ChatEvents.MessageReceived, {
          from: fromUser,
          text,
          roomId: rid,
          at: Date.now(),
        });
    }
  }

  // Optional: direct emit to a user's socket
  @SubscribeMessage(ChatEvents.DMSend)
  sendDirectMessage(
    client: Socket,
    payload: SendDirectMessageDto,
  ) {
    const { to, text } = payload;
    if (!to || !text) return;
    const toSocketId = this.userToSocket.get(to);
    if (toSocketId) {
      this.server
        .to(toSocketId)
        .emit(ChatEvents.DMReceived, {
          from:
            this.socketToUser.get(client.id) ||
            client.id,
          text,
          at: Date.now(),
        });
    }
  }

  private buildRoomId(a: string, b: string) {
    return [a, b].sort().join('|');
  }
}
