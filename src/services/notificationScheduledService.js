const { NotificationEvent, NotificationStatus } = require("../domain/const/notificationConst");
const { ofKakaoWork } = require("../domain/notificationSend");
const { sendMessageByEmail } = require("../external/kakaoworkApiClient");
const { getNow } = require("../utils/clockHolder");
const { buildNewCommentMessage, buildIssueAssigneeChangedMessage, buildIssueStateChangedMessage } = require("./messageBuilder");
const { getSendableNotificationEvents, save, getByMinutesAgo, changeStatus, increaseRetryCount, getNotifications,
    updateStatusAndMessage
} = require("./notificationSendRepository");

async function insertNotificationSend() {
    const notificationEvents = await getSendableNotificationEvents();

    for (const element of notificationEvents) {

        if (element.event_type == NotificationEvent.NEW_COMMENT) {
            let notificationSend = ofKakaoWork(
                NotificationEvent.NEW_COMMENT,
                element.id,
                element.platform_user_id,
                element.n4user_id,
                '새로운 코멘트가 등록되었습니다.',
                new Date(getNow())
            );

            await save(notificationSend);
        }
    }

    return notificationEvents.length;
}

async function buildNotificationMessage() {
    const notifications = await getNotifications(NotificationStatus.CREATED);

    for (const notification of notifications) {
        let message = ``;
        if (notification.event_type == NotificationEvent.ISSUE_STATE_CHANGED) {
            message = await buildIssueStateChangedMessage(notification.reference_id, notification.created);
        }

        if (notification.event_type == NotificationEvent.ISSUE_ASSIGNEE_CHANGED) {
            message = await buildIssueAssigneeChangedMessage(notification.reference_id, notification.created);
        }

        if (notification.event_type == NotificationEvent.NEW_COMMENT) {
            message = await buildNewCommentMessage(notification.reference_id, notification.created);
        }

        await updateStatusAndMessage(notification.id, NotificationStatus.PEND, message);
    }
}

async function send() {
    const tenMinutesAgo = new Date(getNow() - 10 * 60 * 1000); // 10분 전 시간 계산
    const notifications = await getByMinutesAgo(tenMinutesAgo);

    let successCount = 0;
    let failCount = 0;

    for (const notification of notifications) {
        const { id, status, platform_user_id, title, body, retry_count } = notification;

        if (status === NotificationStatus.PEND || status === NotificationStatus.FAIL) {
            const result = await sendMessageByEmail(platform_user_id, title, body);

            if (result.success) {
                await changeStatus(id, NotificationStatus.SUCCESS);
                successCount++;
            } else {
                await changeStatus(id, NotificationStatus.FAIL);
                failCount++;
            }
        }
    }

    return {
        successCount, failCount
    }
}

module.exports = {
    insertNotificationSend, send, buildNotificationMessage
}
