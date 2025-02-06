const {PrismaClient} = require("@prisma/client");
const {formatDefaultFormatted} = require("../utils/clockHolder");
require('dotenv').config();

const YONA_URL = process.env.YONA_URL;
const prisma = new PrismaClient

const NEW_COMMENT_HEADER = '새로운 코멘트가 등록되었습니다.';
const ISSUE_ASSIGNEE_CHANGED_HEADER = '이슈 담당자로 지정되었습니다.';
const ISSUE_STATE_OPENED_HEADER = '이슈 상태가 변경되었습니다.'

module.exports = {
    buildIssueStateChangedMessage, buildNewCommentMessage, buildIssueAssigneeChangedMessage, buildUpcomingDueDate
}

async function buildUpcomingDueDate(notification) {
    if (!notification.reference_id) return;

    const fetch = await prisma.issue.findFirst({
        select: {
            id: true,
            title: true,
            project: {
                select: {
                    name: true
                }
            }
        },
        where: {
            id: notification.reference_id
        }
    })

    const message = getBlockMessageTemplate(
        notification.title,
        fetch.project.name,
        fetch.title,
        formatDefaultFormatted(notification.created),
        `${YONA_URL}/${fetch.project.name}/issue/${fetch.id}`
    );

    return message;
}

async function buildIssueStateChangedMessage(issueId, notificationEventCreated) {
    if (!issueId) return;

    const fetch = await prisma.issue.findFirst({
        select: {
            id: true,
            title: true,
            project: {
                select: {
                    name: true
                }
            }
        },
        where: {
            id: issueId
        }
    })

    const message = getBlockMessageTemplate(
        ISSUE_STATE_OPENED_HEADER,
        fetch.project.name,
        fetch.title,
        formatDefaultFormatted(notificationEventCreated),
        `${YONA_URL}/${fetch.project.name}/issue/${fetch.id}`
    );

    return message;
}

async function buildIssueAssigneeChangedMessage(issueId, notificationEventCreated) {
    if (!issueId) return;

    const fetch = await prisma.issue.findFirst({
        select: {
            id: true,
            title: true,
            project: {
                select: {
                    name: true
                }
            }
        },
        where: {
            id: issueId
        }
    })

    const message = getBlockMessageTemplate(
        ISSUE_ASSIGNEE_CHANGED_HEADER,
        fetch.project.name,
        fetch.title,
        formatDefaultFormatted(notificationEventCreated),
        `${YONA_URL}/${fetch.project.name}/issue/${fetch.id}`
    )

    return message;
}

async function buildNewCommentMessage(notificationEventId, notificationEventCreated) {

    if (!notificationEventId) return;

    const notificationEvent = await prisma.notification_event.findFirst({
        where: {
            id: notificationEventId
        }
    })

    const fetch = await prisma.issue_comment.findFirst({
        where: {
            id: notificationEvent.resource_id
        },
        select: {
            id: true,
            issue: {
                select: {
                    id: true,
                    title: true,
                    project: {
                        select: {
                            name: true
                        }
                    }
                }
            }
        }
    })

    const projectName = fetch.issue.project.name;
    const issue = fetch.issue.title;
    const created = formatDefaultFormatted(notificationEventCreated);
    const directLink = `${YONA_URL}/${projectName}/issue/${fetch.issue.id}#comment-${fetch.id}`

    const message = getBlockMessageTemplate(NEW_COMMENT_HEADER, projectName, issue, created, directLink);
    return message;
}

function getBlockMessageTemplate(header, projectName, issueTitle, created, directLink) {
    let template = `
        [
          {
            "type": "header",
            "text": "${header}",
            "style": "white"
          },
           {
            "type": "description",
            "term": "프로젝트",
            "content": {
              "type": "text",
              "text": "${projectName}"
            }
          },
           {
            "type": "description",
            "term": "이슈",
            "content": {
              "type": "text",
              "text": "${issueTitle}"
            }
          },
          {
            "type": "description",
            "term": "일시",
            "content": {
              "type": "text",
              "text": "${created}"
            }
          },
          {
            "type": "button",
            "text": "브라우저로 열기",
            "style": "primary",
            "action": {
              "type": "open_system_browser",
              "name": "button1",
              "value": "${directLink}"
            }
          }
        ]
      `

    return template;
}
