"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMovieStorage = exports.addDownloadFirestore = exports.deleteFromIndex = exports.updateIndex = exports.addToIndex = void 0;
const functions = require("firebase-functions");
const algoliasearch_1 = require("algoliasearch");
const admin = require("firebase-admin");
const BUCKET_ID = "netfrix-67d95.appspot.com";
const APPID = process.env.ALGOLIA_APP;
const ADMINKEY = process.env.ALGOLIA_ADMIN_KEY;
console.log(APPID);
console.log(ADMINKEY);
const client = (0, algoliasearch_1.default)(APPID, ADMINKEY);
const index = client.initIndex("Movies");
exports.addToIndex = functions.firestore.document("Movies/{moviesID}").onCreate(snap => {
    const data = snap.data();
    const objectID = snap.id;
    return index.saveObject(Object.assign(Object.assign({}, data), { objectID }));
});
exports.updateIndex = functions.firestore.document("Movies/{moviesID}").onUpdate(change => {
    const newData = change.after.data();
    const objectID = change.after.id;
    return index.saveObject(Object.assign(Object.assign({}, newData), { objectID }));
});
exports.deleteFromIndex = functions.firestore.document("Movies/{moviesID}").onDelete(snap => {
    return index.deleteObject(snap.id);
});
exports.addDownloadFirestore = functions.storage
    .bucket(BUCKET_ID).object().onFinalize(async (object) => {
    var _a, _b;
    if (!((_a = object.name) === null || _a === void 0 ? void 0 : _a.includes(".part"))) {
        const db = admin.firestore();
        const data = {
            name: (_b = object.name) === null || _b === void 0 ? void 0 : _b.replace("Downloads/", ""),
            contentType: object.contentType,
            filePath: object.name,
            createdAt: object.timeCreated,
            updatedAt: object.updated,
            isArchived: false
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