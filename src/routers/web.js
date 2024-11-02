import express from "express";
import request from 'request';

let router = express.Router();

let initWebRoutes = (app) => {
    router.get("/", (req, res) => {
        res.send("Hello World");
    });

    router.get("/webhook", (req, res) => {
        // Hardcode token để test
        const VERIFY_TOKEN = "your_custom_verify_token";
        
        console.log("Webhook GET request received");
        console.log("Expected token:", VERIFY_TOKEN);
        
        let mode = req.query["hub.mode"];
        let token = req.query["hub.verify_token"];
        let challenge = req.query["hub.challenge"];

        console.log("Received mode:", mode);
        console.log("Received token:", token); 
        console.log("Received challenge:", challenge);

        // So sánh chính xác token
        if (mode === "subscribe" && token === VERIFY_TOKEN) {
            console.log("WEBHOOK_VERIFIED");
            res.status(200).send(challenge);
        } else {
            console.log("VERIFICATION_FAILED");
            console.log("Token không khớp");
            res.sendStatus(403);
        }
    });

    app.use("/", router);
    return app;
};

export default initWebRoutes;