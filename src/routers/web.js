import express from "express";
import request from 'request';

let router = express.Router();

let initWebRoutes = (app) => {
    // Homepage route
    router.get("/", (req, res) => {
        res.send("Hello World");
    });

    // Webhook verification
    router.get("/webhook", (req, res) => {
        // Parse parameters from the webhook verification request
        let mode = req.query["hub.mode"];
        let token = req.query["hub.verify_token"];
        let challenge = req.query["hub.challenge"];

        // Print logs for debugging
        console.log("Webhook GET request received");
        console.log("mode =", mode);
        console.log("token =", token);
        console.log("challenge =", challenge);

        // Check if a token and mode were sent
        if (mode && token) {
            // Check the mode and token sent are correct
            if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
                // Respond with 200 OK and challenge token from the request
                console.log("WEBHOOK_VERIFIED");
                res.status(200).send(challenge);
            } else {
                // Respond with '403 Forbidden' if verify tokens do not match
                console.log("VERIFICATION_FAILED");
                res.sendStatus(403);
            }
        } else {
            // Return '404 Not Found' if mode or token are missing
            res.sendStatus(404);
        }
    });

    return app.use("/", router);
};

export default initWebRoutes;