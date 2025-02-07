const {getNow} = require("../utils/clockHolder");
const {getDueDateWithinDays, getSendableNotificationEvents} = require("../repository/notificationQueryRepository");
const {save} = require("../repository/notificationSendRepository");
const {NotificationSend} = require('../domain/notificationSend');
const {NotificationEvent} = require("../domain/const/notificationConst");

module.exports = {
    appendNotificationSend, appendUpcomingDueDateIssueWithinDays
}

async function appendNotificationSend() {
    const notificationEvents = await getSendableNotificationEvents();

    for (const element of notificationEvents) {
        try {
            if (element.resource_type == 'ISSUE_COMMENT'
                && element.event_type == NotificationEvent.NEW_COMMENT) {
                let notificationSend = NotificationSend.ofKakaoWork({
                    event_type: NotificationEvent.NEW_COMMENT,
                    reference_table: 'NOTIFICATION_EVENT',
                    reference_id: element.id,
                    platformUserId: element.platform_user_id,
                    n4userId: element.n4user_id,
                    title: '새로운 코멘트가 등록되었습니다.',
                    notificationEventCreated: new Date(getNow()),
                });

                await save(notificationSend);
            }
        } catch (error) {
            console.error('Error appending notification send:', error);
        }
    }

    return notificationEvents.length;
}

function getDueDateTitle(dateDifference) {
    if (dateDifference > 0) {
        return `이슈 마감 D-${dateDifference}`;
    }
    if (dateDifference == 0) {
        return '이슈 마감 D-Day';
    }
    return '';
}

async function appendUpcomingDueDateIssueWithinDays(days) {
    const fetch = await getDueDateWithinDays(days);

    console.log(fetch)

    for (const element of fetch) {
        try {
            let title = getDueDateTitle(element.date_difference);

            let notificationSend = NotificationSend.ofKakaoWork({
                event_type: NotificationEvent.UPCOMING_DUE_DATE,
                reference_id: element.id,
                platformUserId: element.platform_user_id,
                n4userId: element.n4user_id,
                title: title,
                notificationEventCreated: new Date(getNow()),
                reference_table: 'ISSUE'
            });

            await save(notificationSend);
        } catch (error) {
            console.error('Error appending upcoming due date issue:', error);
        }
    }
}
