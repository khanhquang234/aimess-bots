import express from "express";
import request from 'request';

let router = express.Router();

let initWebRoutes = (app) => {
    router.get("/", (req, res) => {
        res.send("Hello World");
    });

    router.get("/webhook", (req, res) => {
        console.log("Webhook GET request received");
        
        let mode = req.query["hub.mode"];
        let token = req.query["hub.verify_token"]; 
        let challenge = req.query["hub.challenge"];

        console.log("mode =", mode);
        console.log("token =", token);
        console.log("challenge =", challenge);
        console.log("Expected token =", process.env.VERIFY_TOKEN);

        // Kiểm tra chính xác token
        if (mode === "subscribe" && token === "your_custom_verify_token") {
            console.log("WEBHOOK_VERIFIED");
            res.status(200).send(challenge);
        } else {
            console.log("VERIFICATION_FAILED"); 
            res.sendStatus(403);
        }
    });

    app.use("/", router);
    return app;
};

export default initWebRoutes;