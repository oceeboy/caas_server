/**
 * ####### VERSION_1 ####
 * this is to test a connection between two people and a group
 */

import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

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

  async handleConnection(client: Socket) {
    // Expect a userId in connection handshake query for simplicity
    const userId = String(
      client.handshake.query.userId || '',
    );
    if (userId) {
      this.userToSocket.set(userId, client.id);
      this.socketToUser.set(client.id, userId);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.socketToUser.get(
      client.id,
    );
    if (userId) {
      this.userToSocket.delete(userId);
      this.socketToUser.delete(client.id);
    }
  }

  // Join a two-person room using a deterministic roomId (e.g., `${a}|${b}` sorted)
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    client: Socket,
    payload: { me: string; peer: string },
  ) {
    const { me, peer } = payload;
    if (!me || !peer) return;
    const roomId = this.buildRoomId(me, peer);

    // Leave previous rooms except own socket room
    for (const room of client.rooms) {
      if (room !== client.id) client.leave(room);
    }

    client.join(roomId);
    // Notify client that joined
    client.emit('joinedRoom', { roomId });
  }

  // Broadcast message to the two-person room
  @SubscribeMessage('message')
  handleMessage(
    client: Socket,
    payload: {
      roomId?: string;
      to?: string;
      text: string;
    },
  ) {
    const { roomId, to, text } = payload;
    if (!text) return;

    // If roomId provided, emit to room
    if (roomId) {
      this.server.to(roomId).emit('message', {
        from:
          this.socketToUser.get(client.id) ||
          client.id,
        text,
        roomId,
        at: Date.now(),
      });
      return;
    }

    // Else if a specific peer `to` provided, resolve room and emit
    const fromUser = this.socketToUser.get(
      client.id,
    );
    if (fromUser && to) {
      const rid = this.buildRoomId(fromUser, to);
      this.server.to(rid).emit('message', {
        from: fromUser,
        text,
        roomId: rid,
        at: Date.now(),
      });
    }
  }

  // Optional: direct emit to a user's socket
  @SubscribeMessage('privateMessage')
  handlePrivateMessage(
    client: Socket,
    payload: { to: string; text: string },
  ) {
    const { to, text } = payload;
    if (!to || !text) return;
    const toSocketId = this.userToSocket.get(to);
    if (toSocketId) {
      this.server
        .to(toSocketId)
        .emit('privateMessage', {
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
