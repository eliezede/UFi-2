import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCRSmO_LiqNYLfy7MPXFQxQs4Xm6TIE4ok",
  authDomain: "u-fi-72fa4.firebaseapp.com",
  projectId: "u-fi-72fa4",
  storageBucket: "u-fi-72fa4.firebasestorage.app",
  messagingSenderId: "684875105650",
  appId: "1:684875105650:web:bd33835568f22ad6d189eb",
  measurementId: "G-Q459YL76E9"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;