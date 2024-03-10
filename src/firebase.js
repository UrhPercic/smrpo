// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCsjZvumZ5BD6s-lAUNMwZVszJFFygV0B0",
  authDomain: "smrpo-acd88.firebaseapp.com",
  projectId: "smrpo-acd88",
  storageBucket: "smrpo-acd88.appspot.com",
  messagingSenderId: "813347671451",
  appId: "1:813347671451:web:90f2ac07b09cd372ca653e",
  measurementId: "G-ZSZ68QPNX7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default app;