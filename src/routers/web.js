import express from "express";
import request from 'request';

let router = express.Router();

let initWebRoutes = (app) => {
    // Route mặc định
    router.get("/", (req, res) => {
        return res.send("Hello World");
    });

    // Webhook verification
    router.get("/webhook", (req, res) => {
        let mode = req.query["hub.mode"];
        let token = req.query["hub.verify_token"];
        let challenge = req.query["hub.challenge"];

        if (mode && token) {
            if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
                console.log("WEBHOOK_VERIFIED");
                res.status(200).send(challenge);
            } else {
                res.sendStatus(403);
            }
        }
    });

    // Xử lý các sự kiện webhook
    router.post("/webhook", (req, res) => {
        let body = req.body;

        if (body.object === "page") {
            body.entry.forEach(function(entry) {
                let webhook_event = entry.messaging[0];
                let sender_psid = webhook_event.sender.id;

                if (webhook_event.message) {
                    handleMessage(sender_psid, webhook_event.message);
                } else if (webhook_event.postback) {
                    handlePostback(sender_psid, webhook_event.postback);
                }
            });

            res.status(200).send("EVENT_RECEIVED");
        } else {
            res.sendStatus(404);
        }
    });

    return app.use("/", router);
};

// Xử lý tin nhắn
function handleMessage(sender_psid, received_message) {
    let response;
    if (received_message.text) {    
        response = {
            "text": `Bạn vừa gửi: "${received_message.text}"`
        }
    }  
    callSendAPI(sender_psid, response);    
}

// Xử lý postback
function handlePostback(sender_psid, received_postback) {
    let response = {
        "text": "Cảm ơn!"
    }
    callSendAPI(sender_psid, response);
}

// Gửi phản hồi qua Facebook API
function callSendAPI(sender_psid, response) {
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    }

    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('Message sent!')
        } else {
            console.error("Unable to send message:" + err);
        }
    }); 
}

export default initWebRoutes;