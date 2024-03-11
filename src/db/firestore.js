import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";
import app from "./firebase";

const db = getFirestore(app);

export const getData = async (collectionName) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const addData = async (collectionName, data) => {
  const docRef = await addDoc(collection(db, collectionName), data);
  return docRef.id;
};
