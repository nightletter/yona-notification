const fetch = require('node-fetch');
require('dotenv').config();

async function fetchUserByEmail(email) {
    const url = `${process.env.KAKAOWORK_REQUEST_URL}/users.find_by_email?email=${email}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.KAKAOWORK_BOT_TOKEN}`
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

async function sendMessageByEmail(email, title, message) {
    const url = `${process.env.KAKAOWORK_REQUEST_URL}/messages.send_by_email`

    try {
        const body = JSON.stringify({
            email: email,
            text: title,
            blocks: JSON.parse(message)
        });

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.KAKAOWORK_BOT_TOKEN}`,
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
