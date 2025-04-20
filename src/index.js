import "express-async-errors";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import ENV_CONFIG from "./app.config.js";
import fs from "fs";
import https from "https";

// const originalLog = console.log;

// // Create a new log function
// console.log = function (...args) {
//     // Create a new error to capture the stack trace
//     const error = new Error();
//     // Extract the stack trace
//     const stack = error.stack.split('\n');
//     // Get the caller's file location from the stack trace
//     // Stack trace format may vary, adjust the index as necessary
//     const callerLocation = stack[2].trim();

//     // Append the caller location to the log message
//     originalLog.apply(console, [...args, `\nCalled from: ${callerLocation}`]);
// };


const options = {
    key: fs.readFileSync('D:/Web Dev/_keys/localhost.key'),
    cert: fs.readFileSync('D:/Web Dev/_keys/localhost.crt'),
}

connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.log(error);
            console.log("App is not connected!!");
        });
        // app.listen(ENV_CONFIG.PORT, () => {
        //     console.log("App is listening on port " + ENV_CONFIG.PORT);
        // });
        https.createServer(options, app).listen(ENV_CONFIG.PORT, () => {
            console.log("App is listening on port " + ENV_CONFIG.PORT);
        });
    })
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });
