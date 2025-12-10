export interface JoinRoomDto {
  me: string;
  peer: string;
}

export interface SendRoomMessageDto {
  roomId?: string;
  to?: string;
  text: string;
}

export interface SendDirectMessageDto {
  to: string;
  text: string;
}
