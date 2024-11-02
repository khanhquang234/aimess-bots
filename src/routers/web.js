import express from "express";

let router = express.Router();

let initWebRoutes = (app) => {
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

    // Handle messages
    router.post("/webhook", (req, res) => {
        let body = req.body;

        if (body.object === "page") {
            body.entry.forEach(function(entry) {
                let webhook_event = entry.messaging[0];
                console.log(webhook_event);

                let sender_psid = webhook_event.sender.id;
                console.log('Sender PSID: ' + sender_psid);

                if (webhook_event.message) {
                    handleMessage(sender_psid, webhook_event.message);
                }
            });

            res.status(200).send("EVENT_RECEIVED");
        } else {
            res.sendStatus(404);
        }
    });

    return app.use("/", router);
};

function handleMessage(sender_psid, received_message) {
    let response = {
        "text": `Bạn vừa gửi: "${received_message.text}"`
    };
    
    // Gửi response qua Facebook API
    // Bạn sẽ cần thêm hàm callSendAPI ở đây
}

export default initWebRoutes;