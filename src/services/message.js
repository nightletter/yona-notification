function getTemplate(header, issue, created, directLink) {
    let template = `{
        "text": "블록킷 메시지입니다.",
        "blocks": [
          {
            "type": "header",
            "text": "${header}",
            "style": "white"
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
      }`

      return template;
}

module.exports = {
    getTemplate
}