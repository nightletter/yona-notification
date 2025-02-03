const schedule = require('node-schedule');
const { insertNotificationSend, send, buildNotificationMessage} = require('./notificationScheduledService');

function initializeScheduler() {
    schedule.scheduleJob('*/10 * * * * *', async () => {
        const raw = await insertNotificationSend();
        console.log(`insertNotificationSend task at ${new Date().toLocaleString()}. Inserted ${raw} notification(s).`);
    });

    schedule.scheduleJob('*/10 * * * * *', async () => {
        const raw = await buildNotificationMessage();
        console.log(`buildNotificationMessage task at ${new Date().toLocaleString()}. Inserted ${raw} notification(s).`);
    });

    schedule.scheduleJob('*/10 * * * * *', async () => {
        const result = await send();
        console.log(`Task completed: ${result.successCount} notification(s) sent successfully, ${result.failCount} notification(s) failed.`);
    })
}

module.exports = {
    initializeScheduler
};
