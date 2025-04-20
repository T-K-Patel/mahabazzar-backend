import { createCanvas, loadImage } from "canvas";
import { randomBytes } from "crypto";
import path from "path";
import Jimp from 'jimp'
const random = {
    int: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
};

// Constants
const WIDTH = 600;
const HEIGHT = 200;
const MIN_FONT_SIZE = 90;
const MAX_FONT_SIZE = 120;
const PADDING = 20;

// Load a font
// registerFont(path.join(process.cwd(), '/src/utils', './DrawveticaMini.ttf'), { family: 'DrawveticaMini' });

async function applyBlur(canvas, ctx, radius) {
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { data, width, height } = image;

    const horizontalBlurData = new Uint8ClampedArray(data.length);
    const verticalBlurData = new Uint8ClampedArray(data.length);

    function applyHorizontalBlur() {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let red = 0,
                    green = 0,
                    blue = 0,
                    alpha = 0;
                for (let dx = -radius; dx <= radius; dx++) {
                    const nx = Math.min(Math.max(x + dx, 0), width - 1);
                    const index = (y * width + nx) * 4;
                    red += data[index];
                    green += data[index + 1];
                    blue += data[index + 2];
                    alpha += data[index + 3];
                }
                const dataIndex = (y * width + x) * 4;
                horizontalBlurData[dataIndex] = red / (radius * 2 + 1);
                horizontalBlurData[dataIndex + 1] = green / (radius * 2 + 1);
                horizontalBlurData[dataIndex + 2] = blue / (radius * 2 + 1);
                horizontalBlurData[dataIndex + 3] = alpha / (radius * 2 + 1);
            }
        }
    }

    function applyVerticalBlur() {
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                let red = 0,
                    green = 0,
                    blue = 0,
                    alpha = 0;
                for (let dy = -radius; dy <= radius; dy++) {
                    const ny = Math.min(Math.max(y + dy, 0), height - 1);
                    const index = (ny * width + x) * 4;
                    red += horizontalBlurData[index];
                    green += horizontalBlurData[index + 1];
                    blue += horizontalBlurData[index + 2];
                    alpha += horizontalBlurData[index + 3];
                }
                const dataIndex = (y * width + x) * 4;
                verticalBlurData[dataIndex] = red / (radius * 2 + 1);
                verticalBlurData[dataIndex + 1] = green / (radius * 2 + 1);
                verticalBlurData[dataIndex + 2] = blue / (radius * 2 + 1);
                verticalBlurData[dataIndex + 3] = alpha / (radius * 2 + 1);
            }
        }
    }

    applyHorizontalBlur();
    applyVerticalBlur();

    for (let i = 0; i < data.length; i++) {
        data[i] = verticalBlurData[i];
    }

    ctx.putImageData(image, 0, 0);
}


async function applyGaussianBlur(ctx, blurRadius) {
    // Get the image data from the canvas
    const imageData = ctx.getImageData(0, 0, WIDTH, HEIGHT);

    // Create a Jimp image from the image data
    const jimpImage = new Jimp({ width: WIDTH, height: HEIGHT, data: Buffer.from(imageData.data.buffer) });

    // Apply Gaussian blur
    jimpImage.blur(blurRadius);

    // Get the blurred image data back
    const blurredBuffer = await jimpImage.getBufferAsync(Jimp.MIME_PNG);
    const blurredImage = await loadImage(blurredBuffer);

    // Draw the blurred image back onto the canvas
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.drawImage(blurredImage, 0, 0);
}

// Function to apply glitch effect to the canvas image
async function applyGlitchEffect(ctx) {
    const imageData = ctx.getImageData(0, 0, WIDTH, HEIGHT);
    const jimpImage = new Jimp({ width: WIDTH, height: HEIGHT, data: Buffer.from(imageData.data.buffer) });

    // Apply horizontal shifts
    for (let y = 0; y < HEIGHT; y += Math.random() * 10 + 5) {
        const shift = (Math.random() - 0.5) * 30; // Shift intensity
        for (let x = 0; x < WIDTH; x++) {
            const idx = (y * WIDTH + x) * 4;
            const shiftX = Math.floor(x + shift);
            if (shiftX >= 0 && shiftX < WIDTH) {
                const newIdx = (y * WIDTH + shiftX) * 4;
                jimpImage.bitmap.data[idx] = imageData.data[newIdx];
                jimpImage.bitmap.data[idx + 1] = imageData.data[newIdx + 1];
                jimpImage.bitmap.data[idx + 2] = imageData.data[newIdx + 2];
                jimpImage.bitmap.data[idx + 3] = imageData.data[newIdx + 3];
            }
        }
    }

    // Apply color channel offset
    const colorOffset = 7;
    for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
            const idx = (y * WIDTH + x) * 4;
            if (x + colorOffset < WIDTH) {
                const rIdx = (y * WIDTH + x + colorOffset) * 4;
                jimpImage.bitmap.data[idx] = imageData.data[rIdx]; // Red channel
            }
            if (x - colorOffset >= 0) {
                const bIdx = (y * WIDTH + x - colorOffset) * 4;
                jimpImage.bitmap.data[idx + 2] = imageData.data[bIdx + 2]; // Blue channel
            }
        }
    }

    const glitchBuffer = await jimpImage.getBufferAsync(Jimp.MIME_PNG);
    const glitchedImage = await loadImage(glitchBuffer);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.drawImage(glitchedImage, 0, 0);
}


function generateNoise(ctx, level = 1500) {
    for (let i = 0; i < level; i++) {
        const x = random.int(0, WIDTH - 1);
        const y = random.int(0, HEIGHT - 1);
        ctx.fillStyle = `rgb(${random.int(0, 150)}, ${random.int(
            0,
            150
        )}, ${random.int(0, 150)})`;
        ctx.fillRect(x, y, random.int(1, 4), random.int(1, 4));
    }
}

function drawBezierCurve(
    ctx,
    start,
    control1,
    control2,
    end,
    color,
    width = 2
) {
    ctx.beginPath();
    ctx.moveTo(start[0], start[1]);
    ctx.bezierCurveTo(
        control1[0],
        control1[1],
        control2[0],
        control2[1],
        end[0],
        end[1]
    );
    ctx.strokeStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    ctx.lineWidth = width;
    ctx.stroke();
}

function generateBezierCurves(ctx) {
    const lines = random.int(3, 6);
    for (let i = 0; i < lines; i++) {
        const start = [random.int(0, WIDTH), random.int(0, HEIGHT)];
        const end = [random.int(0, WIDTH), random.int(0, HEIGHT)];
        const control1 = [random.int(0, WIDTH), random.int(0, HEIGHT)];
        const control2 = [random.int(0, WIDTH), random.int(0, HEIGHT)];
        const color = [
            random.int(0, 100),
            random.int(0, 100),
            random.int(0, 100),
        ];
        const width = random.int(2, 4);
        drawBezierCurve(ctx, start, control1, control2, end, color, width);
    }
}

async function drawText(ctx, text) {
    let totalTextWidth = 0;
    let maxTextHeight = 0;
    const charData = [];

    for (const char of text) {
        const fontSize = random.int(MIN_FONT_SIZE, MAX_FONT_SIZE);
        const font = `${fontSize}px Sans-Serif`;
        ctx.font = font;
        const metrics = ctx.measureText(char);
        const charWidth = metrics.width;
        const charHeight = fontSize; // Assuming height equals font size for simplicity
        totalTextWidth += charWidth;
        charData.push({ char, font, charWidth, charHeight });
        if (charHeight > maxTextHeight) {
            maxTextHeight = charHeight;
        }
    }

    // Adding padding between characters
    totalTextWidth += PADDING * (text.length - 1);

    let x = (WIDTH - totalTextWidth) / 2;
    let y = (HEIGHT - maxTextHeight) / 2 + 80;
    const maxColorCode = 100
    for (const { char, font, charWidth } of charData) {
        ctx.font = font;
        ctx.fillStyle = `rgb(${random.int(0, maxColorCode)}, ${random.int(
            0, maxColorCode
        )}, ${random.int(0, maxColorCode)})`;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((random.int(-30, 30) * Math.PI) / 180);
        ctx.fillText(char, 0, 0);
        ctx.restore();
        x += charWidth + PADDING; // Ensuring equal spacing between characters
    }
}

async function generateSecureImage(text) {
    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    await drawText(ctx, text);
    generateNoise(ctx);
    generateBezierCurves(ctx);
    await applyGlitchEffect(ctx);

    // Simulate Gaussian blur effect by using a combination of blur and unsharp mask
    await applyGaussianBlur(ctx, 2);

    const buffer = canvas.toBuffer("image/png");
    return buffer;
}

function generateSecureCaptcha(length = 6) {
    const charset =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charsetLength = charset.length;
    let randomString = "";

    // Generate random bytes
    const buffer = randomBytes(length);
    // Map each random byte to a character in the charset
    for (let i = 0; i < length; i++) {
        // Ensure byte value is within the charset range
        const randomByte = buffer[i] % charsetLength;
        randomString += charset[randomByte];
    }
    return randomString;
}

async function createCaptcha(text = undefined) {
    const captcha = text ?? generateSecureCaptcha();
    const captchaImage = await generateSecureImage(captcha);
    return { captcha, captchaImage };
}
export { generateSecureCaptcha };
export default { createCaptcha };
