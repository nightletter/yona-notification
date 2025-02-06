const {PrismaClient} = require("@prisma/client");
const {NotificationSend} = require("../domain/notificationSend");
const prisma = new PrismaClient();

module.exports = {
    save, update, findById, getNotifications, getByMinutesAgo
}

async function findById(id) {
    let fetch = await prisma.notification_send.findUnique({
        where: {
            id: id
        }
    });

    return NotificationSend.from(fetch);
}

async function update(notificationSend) {
    return prisma.$transaction(async (transaction) => {
        return transaction.notification_send.update({
            where: {
                id: notificationSend.id
            },
            data: {
                insertion_method: notificationSend.insertion_method,
                event_type: notificationSend.event_type,
                reference_table: notificationSend.reference_table,
                reference_id: notificationSend.reference_id,
                platform: notificationSend.platform,
                platform_user_id: notificationSend.platform_user_id,
                receiver_id: notificationSend.receiver_id,
                status: notificationSend.status,
                title: notificationSend.title,
                body_type: notificationSend.body_type,
                body: notificationSend.body,
                retry_count: notificationSend.retry_count,
                created: notificationSend.created
            }
        });
    });
}

async function save(notificationSend) {
    return prisma.$transaction(async (tx) => {
        return tx.notification_send.create({
            data: {
                insertion_method: notificationSend.insertion_method,
                event_type: notificationSend.event_type,
                reference_table: notificationSend.reference_table,
                reference_id: notificationSend.reference_id,
                platform: notificationSend.platform,
                platform_user_id: notificationSend.platform_user_id,
                receiver_id: notificationSend.receiver_id,
                status: notificationSend.status,
                title: notificationSend.title,
                body_type: notificationSend.body_type,
                body: notificationSend.body,
                retry_count: notificationSend.retry_count,
                created: notificationSend.created
            }
        });
    });
}

async function getNotifications(status) {
    const fetch = await prisma.notification_send.findMany({
        where: {
            status: status
        }
    })

    return fetch.map(item => NotificationSend.from(item));
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

    return fetch.map(item => NotificationSend.from(item));
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
                retry_count: retryCount +1
            },
            where: {
                id: id
            }
        })
    })
}


