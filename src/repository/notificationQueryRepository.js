const {PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
    getDueDateWithinDays, getSendableNotificationEvents
}

async function getDueDateWithinDays(day) {
    const fetch = await prisma.$queryRaw`
        WITH date_range AS (
            SELECT
                NOW() AS start_date,
                DATE_ADD(NOW(), INTERVAL ${day} DAY)
                    + INTERVAL (23 - HOUR(NOW())) HOUR
                    + INTERVAL (59 - MINUTE(NOW())) MINUTE
                    + INTERVAL (59 - SECOND(NOW())) SECOND AS end_date
        )
        SELECT
            issue.id AS id,
            n4user_notification_platform.platform_user_id AS platform_user_id,
            n4user_notification_platform.n4user_id AS n4user_id,
            DATEDIFF(due_date, start_date) AS date_difference,               -- 일(day) 차이
            TIMESTAMPDIFF(HOUR, start_date, due_date) AS hour_difference,    -- 시간(hour) 차이
            due_date
        FROM
            issue
            INNER JOIN assignee ON issue.assignee_id = assignee.id
            INNER JOIN project ON assignee.project_id = project.id
            INNER JOIN n4user_notification_platform ON n4user_notification_platform.n4user_id = assignee.user_id
            inner join date_range dr
        WHERE 1=1
            and issue.due_date BETWEEN dr.start_date AND dr.end_date
            AND n4user_notification_platform.is_used = 1;
    `

    return fetch;
}

async function getSendableNotificationEvents() {
    const fetch = await prisma.$queryRaw`
    SELECT notification_event.id,
           notification_event.resource_type,
           notification_event.event_type,
           notification_event.sender_id,
           notification_event.resource_id,
           notification_event.created,
           notification_event.new_value,
           n4user_notification_platform.n4user_id,
           n4user_notification_platform.platform_user_id
    FROM notification_event
    INNER JOIN notification_event_n4user ON notification_event.id = notification_event_n4user.notification_event_id
    INNER JOIN n4user ON notification_event_n4user.n4user_id = n4user.id
    INNER JOIN n4user_notification_platform ON n4user.id = n4user_notification_platform.n4user_id
    left join notification_send on notification_event.id = notification_send.reference_id
    WHERE 1 = 1
      AND DATE_FORMAT(notification_event.created, '%Y-%m-%d') = DATE_FORMAT(NOW(), '%Y-%m-%d')
      AND n4user_notification_platform.is_used = true
      and notification_send.id is null
 `;
 return fetch;
}
