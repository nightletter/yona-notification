const schedule = require('node-schedule');
const {appendNotificationSend, appendUpcomingDueDateIssueWithinDays} = require("./services/notificationAppender");
const {delegate} = require("./services/notificationMessageDelegator");
const {send} = require("./services/notificationSender");

function initializeScheduler() {
    schedule.scheduleJob('*/10 * * * * *', async () => {
        try {
             await appendNotificationSend();
        } catch (error) {
            console.error('Error in appendNotificationSend:', error);
        }
    });

    schedule.scheduleJob('0 9 * * *', async () => {
        try {
            await appendUpcomingDueDateIssueWithinDays(2);
        } catch (error) {
            console.error('Error in appendNotificationSend:', error);
        }
    });

    schedule.scheduleJob('*/15 * * * * *', async () => {
        try {
            await delegate();
        } catch (error) {
            console.error('Error in delegate:', error);
        }
    });

    schedule.scheduleJob('*/20 * * * * *', async () => {
        try {
            await send();
        } catch (error) {
            console.error('Error in send:', error);
        }
    });
}

module.exports = {
    initializeScheduler
};
