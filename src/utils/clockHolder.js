
function getNow() {
    const kstOffset = 9 * 60 * 60 * 1000; // KST는 UTC+9
    const now = new Date(Date.now() + kstOffset); // 현재 시간을 KST로 변환
    return now;
}
function formatDefaultFormatted(param) {
    const date = new Date(param);

    const pad = (num) => String(num).padStart(2, '0'); // 두 자리 숫자로 패딩
    const year = date.getUTCFullYear(); // UTC 연도
    const month = pad(date.getUTCMonth() + 1); // UTC 월
    const day = pad(date.getUTCDate()); // UTC 일
    const hours = pad(date.getUTCHours()); // UTC 시간
    const minutes = pad(date.getUTCMinutes()); // UTC 분

    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

module.exports = {
    formatDefaultFormatted, getNow
}