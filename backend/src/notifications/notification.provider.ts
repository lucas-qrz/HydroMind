export interface NotificationMessage {
  userId: string;
  title: string;
  message: string;
}
export abstract class NotificationProvider {
  abstract send(message: NotificationMessage): Promise<void>;
}
export class InAppNotificationProvider implements NotificationProvider {
  async send(message: NotificationMessage): Promise<void> {
    void message;
    return Promise.resolve();
  }
}
