import connectDB from "./db/index.js";
import { app } from "./app.js";
import CONFIG from "./app.config.js";

connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.log(error);
            console.log("App is not connected!!");
        });
        app.listen(CONFIG.PORT, () => {
            console.log("App is listening on port " + CONFIG.PORT);
        });
    })
    .catch((err) => {
        console.log(err);
    });
