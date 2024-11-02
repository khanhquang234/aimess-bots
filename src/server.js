import express from "express";
import ViewEngine from "./config/viewEngine.js";
import initWebRoutes from "./routers/web.js";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();

let app = express();

ViewEngine(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

initWebRoutes(app);

app.listen(process.env.PORT || 8080, () => {
    console.log("Server is running on port: ", process.env.PORT || 8080);
});