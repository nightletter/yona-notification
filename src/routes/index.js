const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const Sha256Hash = require('../utils/sha256Hash');
const kakaoworkApiClient = require('../external/kakaoWorkApiClient');

const prisma = new PrismaClient({
});
// Home page
router.get('/', async (req, res) => {
  res.render('index', {
    title: 'Home'
  });
});

router.patch('/notification', async (req, res, next) => {
    try {
    const body = req.body;
    const findUser = await prisma.n4user.findUnique({
        where: {
            login_id: body.loginId
        }
    })

    const hashedRequestPassword = Sha256Hash.hashedPassword(body.password, findUser.password_salt);

    if (findUser.password != hashedRequestPassword) {
        return res.status(400).json({
            message: '비밀번호가 올바르지 않습니다.'
          });
    }

    const fetchKakaoWordUser = await kakaoworkApiClient.fetchUserByEmail(body.platformUserId);
    if (!fetchKakaoWordUser.success) {
        return res.status(400).json({
            message: '카카오워크 유저 정보를 찾을 수 없습니다.'
          });
    }

    if (findUser.password == hashedRequestPassword) {
        await prisma.$transaction( async (transaction) => {
             await transaction.n4user.update({
                where: {
                    id: findUser.id
                },
                data: {
                    is_receive_notification: body.isReceiveNotification == 'Y' ? true : false
                }
            })

            let findN4UserNotificationPlatform = await transaction.n4user_notification_platform.findFirst({
                where: {
                    n4user_id: findUser.id,
                    platform: body.platform
                }
            })

            if (!findN4UserNotificationPlatform) {
                findN4UserNotificationPlatform = await transaction.n4user_notification_platform.create({
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

        res.status(200).send();
    }
} catch(err) {
    console.log(err)
        res.status(500).send();
    }
})

module.exports = router;
