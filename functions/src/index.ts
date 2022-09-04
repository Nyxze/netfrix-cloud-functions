import * as functions from "firebase-functions";
import  algoliasearch from "algoliasearch"
import * as admin from "firebase-admin";
const BUCKET_ID = "netfrix-67d95.appspot.com";
const APPID = process.env.ALGOLIA_APP as string;
const ADMINKEY = process.env.ALGOLIA_ADMIN_KEY as string;

console.log(APPID);
console.log(ADMINKEY);
const client = algoliasearch(APPID, ADMINKEY);

const index = client.initIndex("Movies");


export const addToIndex = functions.firestore.document("Movies/{moviesID}").onCreate(snap => {
  const data = snap.data();
  const objectID = snap.id;

  return index.saveObject({
    ...data, objectID
  });
})
export const updateIndex = functions.firestore.document("Movies/{moviesID}").onUpdate(change => {
  const newData = change.after.data();
  const objectID = change.after.id;

  return index.saveObject({
    ...newData, objectID
  });
})
 
export const deleteFromIndex = functions.firestore.document("Movies/{moviesID}").onDelete(snap => {
  return index.deleteObject(snap.id);
})


export const addDownloadFirestore = functions.storage
  .bucket(BUCKET_ID).object().onFinalize(async (object) => {
    if (!object.name?.includes(".part")) {
      const db = admin.firestore();
      const data = {
        name: object.name?.replace("Downloads/", ""),
        contentType: object.contentType,
        filePath: object.name,
        createdAt: object.timeCreated,
        updatedAt: object.updated,
        isArchived: false
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



