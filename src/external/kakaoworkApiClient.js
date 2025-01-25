const fetch = require('node-fetch');
require('dotenv').config();

const token = process.env.KAKAOWORK_BOT_TOKEN;

async function fetchUserByEmail(email) {
    const url = `https://api.kakaowork.com/v1/users.find_by_email?email=${email}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching user by email:', error);
        throw error;
    }
}

async function sendMessageByEmail(email, message) {
    const url = `${process.env.KAKAOWORK_REQUEST_URL}/messages.send_by_email`

    try {
        const body = JSON.stringify({
            email: email,
            text:'블럭이 들어가면 노출이 안돼용.',
            blocks: JSON.parse(message)
        });

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: body
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching user by email:', error);
        throw error;
    }
}

module.exports = {
    fetchUserByEmail,
    sendMessageByEmail
};
