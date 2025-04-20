import ENV_CONFIG from "../app.config.js";
import { v4 as uuid } from "uuid";
import admin from "firebase-admin";

const FIREBASE_ENV_CONFIG = {
    type: ENV_CONFIG.FIREBASE_TYPE,
    project_id: ENV_CONFIG.FIREBASE_PROJECT_ID,
    private_key_id: ENV_CONFIG.FIREBASE_PRIVATE_KEY_ID,
    private_key: ENV_CONFIG.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    client_email: ENV_CONFIG.FIREBASE_CLIENT_EMAIL,
    client_id: ENV_CONFIG.FIREBASE_CLIENT_ID,
    auth_uri: ENV_CONFIG.FIREBASE_AUTH_URI,
    token_uri: ENV_CONFIG.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url:
        ENV_CONFIG.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: ENV_CONFIG.FIREBASE_CLIENT_X509_CERT_URL,
    universe_domain: "googleapis.com",
};

admin.initializeApp({
    credential: admin.credential.cert(FIREBASE_ENV_CONFIG),
    storageBucket: ENV_CONFIG.FIREBASE_STORAGE_BUCKET,
});

const storage = admin.storage();
const bucket = storage.bucket();

export default async function uploadFileToFirebase(
    fileBuffer,
    folder = "misc",
    fileExt = null,
    mimeType = null
) {
    try {
        const filePath = `${folder}/${uuid()}${fileExt ? `.${fileExt}` : ""}`;

        const file = bucket.file(filePath);

        await file.save(fileBuffer, {
            metadata: {
                contentType: mimeType,
            },
        });

        await file.makePublic();

        return `https://storage.googleapis.com/${bucket.name}/${file.name}`;
    } catch (error) {
        console.error("Error uploading file:", error);
        return null;
    }
}
