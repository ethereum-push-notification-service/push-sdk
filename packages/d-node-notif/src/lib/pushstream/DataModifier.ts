import {
  NotificationEvent,
  NotificationEventType,
  NotificationType,
  NOTIFICATION,
} from './pushStreamTypes';

export class DataModifier {
  public static mapToNotificationEvent(
    data: any,
    notificationEventType: NotificationEventType,
    origin: 'other' | 'self',
    includeRaw = false
  ): NotificationEvent {
    const notificationType =
      (Object.keys(NOTIFICATION.TYPE) as NotificationType[]).find(
        (key) => NOTIFICATION.TYPE[key] === data.payload.data.type
      ) || 'BROADCAST'; // Assuming 'BROADCAST' as the default

    let recipients: string[];

    if (Array.isArray(data.payload.recipients)) {
      recipients = data.payload.recipients;
    } else if (typeof data.payload.recipients === 'string') {
      recipients = [data.payload.recipients];
    } else {
      recipients = Object.keys(data.payload.recipients);
    }

    const notificationEvent: NotificationEvent = {
      event: notificationEventType,
      origin: origin,
      timestamp: data.epoch,
      from: data.sender,
      to: recipients,
      notifID: data.payload_id.toString(),
      channel: {
        name: data.payload.data.app,
        icon: data.payload.data.icon,
        url: data.payload.data.url,
      },
      meta: {
        type: 'NOTIFICATION.' + notificationType,
      },
      message: {
        notification: {
          title: data.payload.notification.title,
          body: data.payload.notification.body,
        },
        payload: {
          title: data.payload.data.asub,
          body: data.payload.data.amsg,
          cta: data.payload.data.acta,
          embed: data.payload.data.aimg,
          meta: {
            domain: data.payload.data.additionalMeta?.domain || 'push.org',
            type: data.payload.data.additionalMeta?.type,
            data: data.payload.data.additionalMeta?.data,
          },
        },
      },
      config: {
        expiry: data.payload.data.etime,
        silent: data.payload.data.silent === '1',
        hidden: data.payload.data.hidden === '1',
      },
      source: data.source,
    };

    if (includeRaw) {
      notificationEvent.raw = {
        verificationProof: data.payload.verificationProof,
      };
    }

    return notificationEvent;
  }
}
