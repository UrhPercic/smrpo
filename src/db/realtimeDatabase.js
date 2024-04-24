import {
  getDatabase,
  ref,
  set,
  push,
  get,
  child,
  update,
  remove,
} from "firebase/database";
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

export const updateData = async (path, data) => {
  const dbRef = ref(db, path);
  try {
    await update(dbRef, data);
  } catch (error) {
    console.error("Failed to update data", error);
  }
};

export const deleteData = async (path) => {
  const db = getDatabase();
  const dataRef = ref(db, path);
  try {
    await remove(dataRef);
    console.log("Data removed successfully");
  } catch (error) {
    console.error("Failed to remove data", error);
    throw error; // This allows error handling in the component that calls deleteData
  }
};
