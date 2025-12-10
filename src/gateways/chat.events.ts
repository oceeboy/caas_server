export const ChatEvents = {
  RoomJoin: 'chat.room.join', // Join a two-person room
  RoomJoined: 'chat.room.joined', // Confirmation of joining
  MessageSend: 'chat.message.send', // Send message to room
  MessageReceived: 'chat.message.received', // Message received in room
  DMSend: 'chat.dm.send', // Direct message send
  DMReceived: 'chat.dm.received', // Direct message received
} as const;

export type ChatEvent =
  (typeof ChatEvents)[keyof typeof ChatEvents];
