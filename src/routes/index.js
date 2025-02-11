const express = require('express');
const router = express.Router();
const {PrismaClient} = require('@prisma/client');
const Sha256Hash = require('../utils/sha256Hash');
const kakaoworkApiClient = require('../external/kakaoWorkApiClient');

const prisma = new PrismaClient({});

router.post('/notification/status', async (req, res) => {
    const notifications = await prisma.n4user_notification_platform.findMany({
        where: {
            n4user_id: req.body.id
        }
    });

    const result = notifications.map(notification => {
        return {
            ...notification,
            id: notification.id.toString(),
            n4user_id: notification.n4user_id.toString()
        };
    });

    res.json({
        data: result
    });
})

router.post('/notification', async (req, res, next) => {
    try {
        const body = req.body;
        const findUser = await prisma.n4user.findUnique({
            where: {
                id: body.n4userId
            }
        })

        if (body.platform == 'KAKAOWORK') {
            const fetchKakaoWordUser = await kakaoworkApiClient.fetchUserByEmail(body.platformUserId);
            if (!fetchKakaoWordUser.success) {
                return res.status(400).json({
                    message: '카카오워크 유저 정보를 찾을 수 없습니다.'
                });
            }
        }


        await prisma.$transaction(async (transaction) => {
            let findN4UserNotificationPlatform = await transaction.n4user_notification_platform.findFirst({
                where: {
                    n4user_id: findUser.id,
                    platform: body.platform
                }
            })

            if (!findN4UserNotificationPlatform) {
                await transaction.n4user_notification_platform.create({
                    data: {
                        n4user_id: findUser.id,
                        platform: body.platform,
                        platform_user_id: body.platformUserId,
                        is_used: body.isReceiveNotification == 'Y' ? true : false
                    }
                });
            } else {
                await transaction.n4user_notification_platform.update({
                    where: {
                        id: findN4UserNotificationPlatform.id
                    },
                    data: {
                        platform_user_id: body.platformUserId,
                        is_used: body.isReceiveNotification == 'Y' ? true : false
                    }
                })
            }
        })

        res.json({
            message: 'success'
        })
    } catch (err) {
        console.log(err)
        res.status(500).send();
    }
})

module.exports = router;
