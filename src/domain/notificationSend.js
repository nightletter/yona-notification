const {NotificationStatus, NotificationPlatform} = require("./const/notificationConst");

class NotificationSend {
    constructor({
                    id = null,
                    insertion_method = null,
                    event_type = null,
                    reference_table = null,
                    reference_id = null,
                    platform = null,
                    platformUserId = null,
                    receiverId = null,
                    status = NotificationStatus.CREATED,
                    title = null,
                    body_type = null,
                    body = null,
                    retry_count = 0,
                    created = new Date()
                }) {
        this.id = id;
        this.insertion_method = 'SCHEDULER';
        this.event_type = event_type;
        this.reference_table = reference_table;
        this.reference_id = reference_id;
        this.platform = platform;
        this.platform_user_id = platformUserId;
        this.receiver_id = receiverId;
        this.status = status;
        this.title = title;
        this.body_type = body_type;
        this.body = body;
        this.retry_count = retry_count;
        this.created = created;
    }

    static from(data) {
        return new NotificationSend({
            id: data.id,
            insertion_method: data.insertion_method,
            event_type: data.event_type,
            reference_table: data.reference_table,
            reference_id: data.reference_id,
            platform: data.platform,
            platformUserId: data.platform_user_id,
            receiverId: data.receiver_id,
            status: data.status,
            title: data.title,
            body_type: data.body_type,
            body: data.body,
            retry_count: data.retry_count,
            created: new Date(data.created), // Ensure the created field is a Date object
        });
    }

    static create(params) {
        return new NotificationSend(params);
    }

    static ofKakaoWork({
                           event_type,
                           reference_id,
                           platformUserId,
                           n4userId,
                           title,
                           notificationEventCreated = new Date(),
                           reference_table = null
                       }) {
        return new NotificationSend({
            event_type,
            reference_id,
            platform: NotificationPlatform.KAKAOWORK,
            platformUserId,
            receiverId: n4userId,
            title,
            created: notificationEventCreated,
            reference_table
        });
    }

    increaseRetryCount() {
        this.retry_count++;
    }

    changeStatus(status) {
        this.status = status;
    }

    setTitle(title) {
        this.title = title;
    }

    setBody(body_type, body) {
        this.body_type = body_type;
        this.body = body;
    }
}

module.exports = {
    NotificationSend
}
