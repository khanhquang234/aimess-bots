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
    let response;

    if (received_message.text) {
        try {
            // Gửi typing indicator
            await sendTypingOn(sender_psid);
            
            const aiResponse = await difyService.chat(received_message.text);
            
            await sendTypingOff(sender_psid);

            response = {
                "messaging_type": "RESPONSE",
                "recipient": {
                    "id": sender_psid
                },
                "message": {
                    "text": aiResponse
                }
            };
        } catch (error) {
            response = {
                "messaging_type": "RESPONSE",
                "recipient": {
                    "id": sender_psid
                },
                "message": {
                    "text": "Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau."
                }
            };
        }
    } else if (received_message.attachments) {
        response = {
            "messaging_type": "RESPONSE", 
            "recipient": {
                "id": sender_psid
            },
            "message": {
                "text": `Tôi đã nhận được ${received_message.attachments[0].type} của bạn. Bạn có thể gửi tin nhắn văn bản để tôi có thể trả lời.`
            }
        };
    }

    if (response) {
        await callSendAPI(sender_psid, response);
    }
}

async function sendTypingOn(sender_psid) {
    const requestBody = {
        "recipient": {
            "id": sender_psid
        },
        "sender_action": "typing_on"
    };

    await callSendAPI(sender_psid, requestBody);
}

async function sendTypingOff(sender_psid) {
    const requestBody = {
        "recipient": {
            "id": sender_psid
        },
        "sender_action": "typing_off"
    };

    await callSendAPI(sender_psid, requestBody);
}

function callSendAPI(sender_psid, request_body) {
    console.log("=== SENDING MESSAGE ===");
    console.log("To:", sender_psid);
    console.log("Request body:", request_body);

    return new Promise((resolve, reject) => {
        request({
            "uri": "https://graph.facebook.com/v2.6/me/messages",
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