import { MessageService } from 'src/message/message.service';

export class ChatService {
  /**
   * this service will handle chat related business logic testing
   * including message sending, receiving, and storage.
   *
   *
   */
  constructor(
    private messageService: MessageService,
  ) {}

  private userDetails = new Map<string, any>();

  private visitorDetails = new Map<string, any>();

  async saveUserDetails(
    userId: string,
    details: any,
  ) {
    this.userDetails.set(userId, details);
  }

  async getUserDetails(userId: string) {
    return this.userDetails.get(userId);
  }

  async deleteUserDetails(userId: string) {
    this.userDetails.delete(userId);
  }
  // Visitor details management
  async saveVisitorDetails(
    visitorId: string,
    details: any,
  ) {
    this.visitorDetails.set(visitorId, details);
  }

  async getVisitorDetails(visitorId: string) {
    return this.visitorDetails.get(visitorId);
  }

  async deleteVisitorDetails(visitorId: string) {
    this.visitorDetails.delete(visitorId);
  }

  // create and store messages

  // message storage can be added here
}
