const { PrismaClient } = require("@prisma/client");
const { formatDefaultFormatted } = require("../utils/clockHolder");
require('dotenv').config();

const YONA_URL = process.env.YONA_URL;
const prisma = new PrismaClient

module.exports = {
  buildNewCommentMessage, buildIssueAssigneeChangedMessage
}

async function buildIssueAssigneeChangedMessage(issueId, notificationEventCreated, newValue) {
}

async function buildNewCommentMessage(issueCommentId, notificationEventCreated) {

  if (!issueCommentId) return;

  const fetch = await prisma.issue_comment.findFirst({
    where: {
      id: issueCommentId
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

  const message = getBlockMessageTemplate(projectName, issue, created, directLink);
  return message;
}

function getBlockMessageTemplate(projectName, issue, created, directLink) {
  let template = `
        [
          {
            "type": "header",
            "text": "새로운 코멘트가 등록되었습니다.",
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
              "text": "${issue}"
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
