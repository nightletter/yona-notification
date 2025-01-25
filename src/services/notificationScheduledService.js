const { NotificationEvent, NotificationStatus } = require("../domain/const/notificationConst");
const { ofKakaoWork } = require("../domain/notificationSend");
const { sendMessageByEmail } = require("../external/kakaoworkApiClient");
const { getNow } = require("../utils/clockHolder");
const { buildNewCommentMessage, buildIssueAssigneeChangedMessage } = require("./messageBuilder");
const { getSendableNotificationEvents, save, getByMinutesAgo, changeStatus, increaseRetryCount } = require("./notificationSendRepository");

async function insertNotificationSend() {
    const notificationEvents = await getSendableNotificationEvents();

    for (const element of notificationEvents) {

        let message = ``

        if (element.event_type == NotificationEvent.NEW_COMMENT) {
            message = await buildNewCommentMessage(element.resource_id, element.created);

            let notificationSend = ofKakaoWork(
                element.id,
                element.n4user_id,
                element.platform_user_id,
                message,
                new Date(getNow())
            );

            save(notificationSend);
        }

        if (element.event_type == NotificationEvent.ISSUE_ASSIGNEE_CHANGED) {
            message = await buildIssueAssigneeChangedMessage(element.resource_id, element.created, element.new_value);
        }
    }

    return notificationEvents.length;
}

async function send() {
    const tenMinutesAgo = new Date(getNow() - 10 * 60 * 1000); // 10분 전 시간 계산
    const notifications = await getByMinutesAgo(tenMinutesAgo);

    let successCount = 0;
    let failCount = 0;

    for (const notification of notifications) {
        const { id, status, platform_user_id, body } = notification;

        if (status === NotificationStatus.PEND || status === NotificationStatus.FAIL) {
            const result = await sendMessageByEmail(platform_user_id, body);

            if (result.success) {
                await changeStatus(id, NotificationStatus.SUCCESS);
                successCount++;
            } else {
                await changeStatus(id, NotificationStatus.FAIL);
                failCount++;
            }

            if (status === NotificationStatus.FAIL) {
                await increaseRetryCount(id);
            }
        }
    }

    return {
        successCount, failCount
    }
}

module.exports = {
    insertNotificationSend, send
}