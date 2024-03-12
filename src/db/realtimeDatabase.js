import { getDatabase, ref, set, push, get, child } from "firebase/database";
import app from "./firebase";

const db = getDatabase(app);

export const addData = async (path, data) => {
  const newRef = push(ref(db, path));
  await set(newRef, data);
  return newRef.key;
};

export const getData = async (path) => {
  const dbRef = ref(db);
  try {
    const snapshot = await get(child(dbRef, path));
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.log("No data available");
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};
