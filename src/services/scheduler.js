const schedule = require('node-schedule');
const { insertNotificationSend, send } = require('./notificationScheduledService');

function initializeScheduler() {
    // schedule.scheduleJob('*/10 * * * * *', async () => {
    //     const raw = await insertNotificationSend();
    //     console.log(`Running scheduled task at ${new Date().toLocaleString()}. Inserted ${raw} notification(s).`);
    // });

    // schedule.scheduleJob('*/10 * * * * *', async () => {
    //     const result = await send();
    //     console.log(`Task completed: ${result.successCount} notification(s) sent successfully, ${result.failCount} notification(s) failed.`);
    // })

    schedule.scheduleJob('*/3 * * * * *', async () => {
        await insertNotificationSend()
        // await send();
        console.log('hi')
    })
}

module.exports = {
    initializeScheduler
}; 