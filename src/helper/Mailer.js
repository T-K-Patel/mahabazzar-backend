import nodemailer from "nodemailer";
import ENV_CONFIG from "../app.config.js";
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: ENV_CONFIG.MAIL_USER,
        pass: ENV_CONFIG.MAIL_PASS,
    },
});

export const sendMail = (mailOptions, callBack) => {
    transporter.sendMail(
        { ...mailOptions, from: `Mahabazzar <${ENV_CONFIG.MAIL_USER}>` },
        callBack
    );
};
