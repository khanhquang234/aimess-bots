import express from "express";
import request from 'request';

let router = express.Router();

let initWebRoutes = (app) => {
    router.get("/webhook", (req, res) => {
        let VERIFY_TOKEN = process.env.VERIFY_TOKEN;
            
        let mode = req.query["hub.mode"];
        let token = req.query["hub.verify_token"];
        let challenge = req.query["hub.challenge"];
            
        if (mode && token) {
            if (mode === "subscribe" && token === VERIFY_TOKEN) {
                console.log("WEBHOOK_VERIFIED");
                res.status(200).send(challenge);
            } else {
                res.sendStatus(403);
            }
        }
    });

    return app.use("/", router);
};

export default initWebRoutes;