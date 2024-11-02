import express from "express";
import request from 'request';
import difyService from '../services/difyService.js';

let router = express.Router();

let initWebRoutes = (app) => {
    router.get("/webhook", (req, res) => {
        console.log("=== WEBHOOK GET REQUEST ===");
        const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
        let mode = req.query["hub.mode"];
        let token = req.query["hub.verify_token"];
        let challenge = req.query["hub.challenge"];

        console.log("Mode:", mode);
        console.log("Token:", token); 
        console.log("Challenge:", challenge);

        if (mode === "subscribe" && token === VERIFY_TOKEN) {
            console.log("WEBHOOK_VERIFIED");
            res.status(200).send(challenge);
        } else {
            console.log("VERIFICATION_FAILED");
            res.sendStatus(403);
        }
    });

    router.post("/webhook", async (req, res) => {
        console.log("=== WEBHOOK POST REQUEST ===");
        console.log("Request body:", JSON.stringify(req.body, null, 2));

        let body = req.body;

        if (body.object === 'page') {
            for (let entry of body.entry) {
                let webhook_event = entry.messaging[0];
                let sender_psid = webhook_event.sender.id;
                
                console.log("Sender PSID:", sender_psid);
                console.log("Event:", JSON.stringify(webhook_event, null, 2));

                if (webhook_event.message) {
                    console.log("Processing message event");
                    await handleMessage(sender_psid, webhook_event.message);
                }
            }
            res.status(200).send('EVENT_RECEIVED');
        } else {
            console.log("Not a page event");
            res.sendStatus(404);
        }
    });

    return app.use("/", router);
};

async function handleMessage(sender_psid, received_message) {
    console.log("=== HANDLING MESSAGE ===");
    console.log("Message:", received_message);

    if (!received_message.text) {
        console.log("Not a text message");
        return;
    }

    try {
        console.log("Getting AI response");
        const aiResponse = await difyService.chat(received_message.text);
        console.log("AI Response:", aiResponse);

        console.log("Sending response to user");
        await callSendAPI(sender_psid, {
            "text": aiResponse
        });
    } catch (error) {
        console.error("Error in handleMessage:", error);
    }
}

function callSendAPI(sender_psid, response) {
    console.log("=== SENDING MESSAGE ===");
    console.log("To:", sender_psid);
    console.log("Response:", response);

    return new Promise((resolve, reject) => {
        let request_body = {
            "recipient": {
                "id": sender_psid
            },
            "message": response
        };

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