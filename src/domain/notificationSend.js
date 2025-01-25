const { getNow } = require('../utils/clockHolder');
const { NotificationStatus, NotificationType, NotificationPlatform } = require('./const/notificationConst');

class NotificationSend {
    constructor(
        notificationType,
        notificationEventId,
        platform,
        platformUserId,
        receiverId,
        body,
        notificationEventCreated
    ) {
        this.notification_type = notificationType;
        this.notification_event_id = notificationEventId;
        this.platform = platform;
        this.platform_user_id = platformUserId;
        this.receiver_id = receiverId;
        this.status = NotificationStatus.PEND;
        this.body = body;
        this.retry_count = 0;
        this.created = notificationEventCreated;
    }

    static ofKakaoWork(notificationEventId, n4userId, platformUserId, message, notificationEventCreated) {
        return new NotificationSend(
            NotificationType.PUSH,
            notificationEventId,
            NotificationPlatform.KAKAOWORK,
            platformUserId,
            n4userId,
            message,
            notificationEventCreated
        )
    }
}

module.exports = NotificationSend;

