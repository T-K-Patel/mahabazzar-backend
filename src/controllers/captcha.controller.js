import captcha from "../utils/captcha.js";

let CaptchaController = {};

CaptchaController.getCaptchaImage = async (req, res) => {
    const captchaObj = await captcha.createCaptcha();
    req.session.captcha = { text: captchaObj.captcha, timestamp: Date.now() };
    res.header("Content-Type", "image/png");
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    res.status(200).send(captchaObj.captchaImage);
};

export default CaptchaController;
