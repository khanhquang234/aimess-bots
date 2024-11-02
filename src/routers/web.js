import express from "express";

let router = express.Router();

let initWebRoutes = (app) => {
    // Test route để kiểm tra server
    router.get("/test", (req, res) => {
        console.log("Test route accessed");
        res.json({
            status: "ok",
            message: "Server is running"
        });
    });

    router.get("/webhook", (req, res) => {
        // Log toàn bộ request
        console.log("\n=== WEBHOOK REQUEST ===");
        console.log("Headers:", req.headers);
        console.log("Query:", req.query);
        console.log("Body:", req.body);
        
        const VERIFY_TOKEN = "your_custom_verify_token";
        
        let mode = req.query["hub.mode"];
        let token = req.query["hub.verify_token"];
        let challenge = req.query["hub.challenge"];

        console.log("\n=== VERIFICATION INFO ===");
        console.log("Expected token:", VERIFY_TOKEN);
        console.log("Received mode:", mode);
        console.log("Received token:", token);
        console.log("Received challenge:", challenge);

        // Kiểm tra điều kiện
        console.log("\n=== VERIFICATION CHECK ===");
        console.log("Mode exists:", !!mode);
        console.log("Token exists:", !!token);
        console.log("Mode is subscribe:", mode === "subscribe");
        console.log("Tokens match:", token === VERIFY_TOKEN);

        if (mode && token) {
            if (mode === "subscribe" && token === VERIFY_TOKEN) {
                console.log("\nVERIFICATION SUCCESS");
                return res.status(200).send(challenge);
            } else {
                console.log("\nVERIFICATION FAILED - Token mismatch");
                return res.sendStatus(403);
            }
        }

        console.log("\nVERIFICATION FAILED - Missing parameters");
        return res.sendStatus(404);
    });

    app.use("/", router);
    return app;
};

export default initWebRoutes;