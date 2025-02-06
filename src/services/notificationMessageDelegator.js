const {NotificationStatus, NotificationEvent} = require("../domain/const/notificationConst");
const {
    buildIssueStateChangedMessage,
    buildIssueAssigneeChangedMessage,
    buildNewCommentMessage, buildUpcomingDueDate
} = require("./messageBuilder");
const {getNotifications, update} = require("../repository/notificationSendRepository");

module.exports = {
    delegate
}

async function delegate() {
    try {
        const notifications = await getNotifications(NotificationStatus.CREATED);

        await Promise.all(notifications.map(async (notification) => {
            let type = '';
            let body = ``;

            if (notification.event_type == NotificationEvent.ISSUE_STATE_CHANGED) {
                type = 'JSON';
                body = await buildIssueStateChangedMessage(notification.reference_id, notification.created);
            }

            if (notification.event_type == NotificationEvent.ISSUE_ASSIGNEE_CHANGED) {
                type = 'JSON';
                body = await buildIssueAssigneeChangedMessage(notification.reference_id, notification.created);
            }

            if (notification.event_type == NotificationEvent.NEW_COMMENT) {
                type = 'JSON';
                body = await buildNewCommentMessage(notification.reference_id, notification.created);
            }

            if (notification.event_type == NotificationEvent.MEMBER_ENROLL_ACCEPT) {
                type = 'TEXT';
                body = notification.title;
            }

            if (notification.event_type == NotificationEvent.NEW_POSTING) {
                type = 'TEXT';
                body = notification.title;
            }

            if (notification.event_type == NotificationEvent.UPCOMING_DUE_DATE) {
                type = 'JSON';
                body = await buildUpcomingDueDate(notification);
            }

            notification.changeStatus(NotificationStatus.PEND);
            notification.setBody(type, body);

            await update(notification);
        }));
    } catch (error) {
        console.error('Error during notification delegation:', error);
    }
}
