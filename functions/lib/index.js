"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMovieStorage = exports.addDownloadFirestore = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const BUCKET_ID = "netfrix-67d95.appspot.com";
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
admin.initializeApp();
exports.addDownloadFirestore = functions.storage
    .bucket(BUCKET_ID).object().onFinalize(async (object) => {
    var _a, _b;
    if (!((_a = object.name) === null || _a === void 0 ? void 0 : _a.includes(".part"))) {
        const db = admin.firestore();
        const data = {
            name: (_b = object.name) === null || _b === void 0 ? void 0 : _b.replace("Downloads/", ""),
            contentType: object.contentType,
            filepath: object.name,
            createdAt: object.timeCreated,
            updatedAt: object.updated
        };
        try {
            await db.collection("Downloads").doc().set(data);
        }
        catch (err) {
            console.log(err);
        }
    }
});
exports.deleteMovieStorage = functions.firestore.document("Movies/{movieUID}")
    .onDelete((snap) => {
    const { filepath, name } = snap.data();
    if (typeof filepath === "undefined" || typeof name === "undefined") {
        console.error("Error while sanitize movie, movie name or movie uid are missing");
        return;
    }
    const file = admin.storage().bucket().file(filepath);
    file.delete().then(() => {
        console.log(`Successfully deleted movie ${name} with UID: ${filepath}`);
    }).catch(err => {
        console.error(`Failed to remove movie, error: ${err}`);
    });
});
//# sourceMappingURL=index.js.map