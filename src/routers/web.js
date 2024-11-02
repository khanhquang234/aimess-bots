import express from "express";
import request from 'request';
import difyService from '../services/difyService.js';

let router = express.Router();

let initWebRoutes = (app) => {
    router.get("/webhook", (req, res) => {
        let mode = req.query["hub.mode"];
        let token = req.query["hub.verify_token"];
        let challenge = req.query["hub.challenge"];

        if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
            console.log("WEBHOOK_VERIFIED");
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    });

    router.post("/webhook", async (req, res) => {
        let body = req.body;

        if (body.object === 'page') {
            for (let entry of body.entry) {
                let webhook_event = entry.messaging[0];
                let sender_psid = webhook_event.sender.id;

                if (webhook_event.message) {
                    await handleMessage(sender_psid, webhook_event.message);
                }
            }
            res.status(200).send('EVENT_RECEIVED');
        } else {
            res.sendStatus(404);
        }
    });

    return app.use("/", router);
};

async function handleMessage(sender_psid, received_message) {
    try {
        // Gửi typing indicator
        await sendTypingOn(sender_psid);

        let response;
        if (received_message.text) {
            // Gọi Dify API với sender_psid
            const aiResponse = await difyService.chat(received_message.text, sender_psid);
            response = {
                "text": aiResponse
            };
        } else if (received_message.attachments) {
            response = {
                "text": "Bạn vui lòng gửi tin nhắn văn bản để tôi có thể trả lời."
            };
        }

        await sendTypingOff(sender_psid);

        if (response) {
            await callSendAPI(sender_psid, response);
        }
    } catch (error) {
        console.error("Error handling message:", error);
        await callSendAPI(sender_psid, {
            "text": "Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau."
        });
    }
}

function sendTypingOn(sender_psid) {
    return callSendAPI(sender_psid, {"sender_action": "typing_on"});
}

function sendTypingOff(sender_psid) {
    return callSendAPI(sender_psid, {"sender_action": "typing_off"});
}

function callSendAPI(sender_psid, response) {
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        ...response
    };

    return new Promise((resolve, reject) => {
        request({
            "uri": "https://graph.facebook.com/v18.0/me/messages",
            "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
            "method": "POST",
            "json": request_body
        }, (err, res, body) => {
            if (!err) {
                console.log('Message sent successfully');
                resolve();
            } else {
                console.error("Failed to send message:", err);
                reject(err);
            }
        });
    });
}

export default initWebRoutes;