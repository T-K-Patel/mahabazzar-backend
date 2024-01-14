import CONFIG from "../app.config.js";
import { v4 as uuid } from "uuid";
import admin from "firebase-admin";

const FIREBASE_CONFIG = {
    type: CONFIG.FIREBASE_TYPE,
    project_id: CONFIG.FIREBASE_PROJECT_ID,
    private_key_id: CONFIG.FIREBASE_PRIVATE_KEY_ID,
    private_key: CONFIG.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    client_email: CONFIG.FIREBASE_CLIENT_EMAIL,
    client_id: CONFIG.FIREBASE_CLIENT_ID,
    auth_uri: CONFIG.FIREBASE_AUTH_URI,
    token_uri: CONFIG.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: CONFIG.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: CONFIG.FIREBASE_CLIENT_X509_CERT_URL,
    universe_domain: "googleapis.com",
};

admin.initializeApp({
    credential: admin.credential.cert(FIREBASE_CONFIG),
    storageBucket: CONFIG.FIREBASE_STORAGE_BUCKET,
});

const storage = admin.storage();

export default async function uploadFileToFirebase(
    fileBuffer,
    folder = "misc",
    fileExt = None,
    mimeType = null
) {
    try {
        const filePath = `${folder}/${uuid()}${fileExt ? `.${fileExt}` : ""}`;

        const bucket = storage.bucket();
        const file = bucket.file(filePath);


        await file.save(fileBuffer, {
            metadata: {
                contentType: mimeType,
            },
        })

        await file.makePublic();

        return `https://storage.googleapis.com/${bucket.name}/${file.name}`;

    } catch (error) {
        console.error("Error uploading file:", error);
        return null;
    }
}
