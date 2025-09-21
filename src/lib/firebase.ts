// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "studio-56845428-6c093",
  "appId": "1:592481250288:web:abc7acb9eaf7e8c4ee4b35",
  "apiKey": "AIzaSyDe_rIUMpaBX8O36glmE0VZNBKHxMQ2ZpM",
  "authDomain": "studio-56845428-6c093.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "592481250288",
  "storageBucket": "studio-56845428-6c093.appspot.com"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
