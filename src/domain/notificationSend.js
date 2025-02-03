const { NotificationStatus, NotificationType, NotificationPlatform } = require('./const/notificationConst');

class NotificationSend {
    constructor(
        event_type,
        reference_id,
        platform,
        platformUserId,
        receiverId,
        title,
        notificationEventCreated
    ) {
        this.event_type = event_type;
        this.reference_id = reference_id;
        this.platform = platform;
        this.platform_user_id = platformUserId;
        this.receiver_id = receiverId;
        this.status = NotificationStatus.CREATED;
        this.title = title;
        this.retry_count = 0;
        this.created = notificationEventCreated;
    }

    static ofKakaoWork(event_type, reference_id, platformUserId, n4userId, title, notificationEventCreated) {
        return new NotificationSend(
            event_type,
            reference_id,
            NotificationPlatform.KAKAOWORK,
            platformUserId,
            n4userId,
            title,
            notificationEventCreated
        )
    }
}

module.exports = NotificationSend;
