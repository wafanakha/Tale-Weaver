import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDOd-6AlJduYQRi4DXv8pQsF0l3ewfPjBk",
  authDomain: "realtime-database-152dc.firebaseapp.com",
  databaseURL:
    "https://realtime-database-152dc-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "realtime-database-152dc",
  storageBucket: "realtime-database-152dc.firebasestorage.app",
  messagingSenderId: "333566091873",
  appId: "1:333566091873:web:cbfecd0318db37becfc020",
  measurementId: "G-77FT4EPXH4",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const db = getDatabase(app);
export const auth = getAuth(app);
