const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function getSendableNotificationEvents() {
    const fetch = await prisma.$queryRaw`
    SELECT notification_event.id,
           notification_event.event_type,
           notification_event.resource_id,
           notification_event.created,
           notification_event.new_value,
           n4user_notification_platform.n4user_id,
           n4user_notification_platform.platform_user_id
    FROM notification_event
    INNER JOIN notification_event_n4user ON notification_event.id = notification_event_n4user.notification_event_id
    INNER JOIN n4user ON notification_event_n4user.n4user_id = n4user.id
    INNER JOIN n4user_notification_platform ON n4user.id = n4user_notification_platform.n4user_id
    left join notification_send on notification_event.id = notification_send.notification_event_id
    WHERE 1 = 1
      AND DATE_FORMAT(notification_event.created, '%Y-%m-%d') = DATE_FORMAT(NOW(), '%Y-%m-%d')
      AND n4user_notification_platform.is_used = true
      and notification_send.id is null
 `; 
 return fetch;
}

async function getByMinutesAgo(minutesAgo) {
    const fetch = await prisma.notification_send.findMany({
        where: {
            created: {
                gte: minutesAgo,
            },
            retry_count: {
                lt: 5,
            },
        },
    });

    return fetch;
}

async function save(notificationSend) {
    return await prisma.$transaction(async (tx) => {
        return await tx.notification_send.create({
            data: {
                notification_type: notificationSend.notification_type,
                notification_event_id: notificationSend.notification_event_id,
                platform: notificationSend.platform,
                platform_user_id: notificationSend.platform_user_id,
                receiver_id: notificationSend.receiver_id,
                status: notificationSend.status,
                body: notificationSend.body,
                retry_count: notificationSend.retry_count,
                created: notificationSend.created
            }
        });
    });
}

async function changeStatus(id, status) {
    return await prisma.$transaction(async (tx) => {
        return await tx.notification_send.update({
            data: {
                status: status
            },
            where: {
                id: id
            }
        })
    })
}

async function increaseRetryCount(id, retryCount) {
    return await prisma.$transaction(async (tx) => {
        return await tx.notification_send.update({
            data: {
                retry_count
            },
            where: {
                id: id
            }
        })
    })
}

module.exports = {
    save, getSendableNotificationEvents, getByMinutesAgo, changeStatus, increaseRetryCount
}