import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCsjZvumZ5BD6s-lAUNMwZVszJFFygV0B0",
  authDomain: "smrpo-acd88.firebaseapp.com",
  projectId: "smrpo-acd88",
  storageBucket: "smrpo-acd88.appspot.com",
  messagingSenderId: "813347671451",
  appId: "1:813347671451:web:90f2ac07b09cd372ca653e",
  measurementId: "G-ZSZ68QPNX7",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default app;
