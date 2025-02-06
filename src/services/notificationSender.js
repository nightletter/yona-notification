const {getNow} = require("../utils/clockHolder");
const {getByMinutesAgo, changeStatus, update} = require("../repository/notificationSendRepository");
const {NotificationStatus} = require("../domain/const/notificationConst");
const {sendMessageByEmail} = require("../external/kakaoWorkApiClient");

module.exports = {
    send
}

async function send() {
    const tenMinutesAgo = new Date(getNow() - 10 * 60 * 1000); // 10분 전 시간 계산
    const notifications = await getByMinutesAgo(tenMinutesAgo);

    let successCount = 0;
    let failCount = 0;

    for (const notification of notifications) {

        if (notification.status === NotificationStatus.PEND
            || notification.status === NotificationStatus.FAIL) {

            const result = await sendMessageByEmail(notification);

            if (result.success) {
                notification.changeStatus(NotificationStatus.SUCCESS);
                successCount++;
            } else {
                notification.changeStatus(NotificationStatus.FAIL)
                failCount++;
            }
        }

        await update(notification);
    }

    return {
        successCount, failCount
    }
}
