// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDOd-6AlJduYQRi4DXv8pQsF0l3ewfPjBk",
  authDomain: "realtime-database-152dc.firebaseapp.com",
  databaseURL: "https://realtime-database-152dc-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "realtime-database-152dc",
  storageBucket: "realtime-database-152dc.firebasestorage.app",
  messagingSenderId: "333566091873",
  appId: "1:333566091873:web:cbfecd0318db37becfc020",
  measurementId: "G-77FT4EPXH4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Realtime Database and export it for use in other services
export const db = getDatabase(app);
