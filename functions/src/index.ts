import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
const BUCKET_ID = "netfrix-67d95.appspot.com";

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

admin.initializeApp();
export const addDownloadFirestore = functions.storage
  .bucket(BUCKET_ID).object().onFinalize(async (object) => {
    if (!object.name?.includes(".part")) {
      const db = admin.firestore();
      const data = {
        name: object.name?.replace("Downloads/", ""),
        contentType: object.contentType,
        filepath: object.name,
        createdAt: object.timeCreated,
        updatedAt: object.updated
      }
      try {
        await db.collection("Downloads").doc().set(data);
      } catch (err) {
        console.log(err);
      }
    }
  });

export const deleteMovieStorage = functions.firestore.document("Movies/{movieUID}")
    .onDelete((snap) => {

    const { filepath, name } = snap.data();
    if (typeof filepath === "undefined" || typeof name === "undefined") {
      console.error("Error while sanitize movie, movie name or movie uid are missing");
      return
    }
    const file = admin.storage().bucket().file(filepath);
    file.delete().then(() => {
      console.log(`Successfully deleted movie ${name} with UID: ${filepath}`);
    }).catch(err => {
      console.error(`Failed to remove movie, error: ${err}`)
    });

  })



