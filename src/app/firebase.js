// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAuZQgifyciIAFNZZQ806YHFSZRut-cpJ8",
  authDomain: "finalyearproject-13c10.firebaseapp.com",
  projectId: "finalyearproject-13c10",
  storageBucket: "finalyearproject-13c10.firebasestorage.app",
  messagingSenderId: "674309328324",
  appId: "1:674309328324:web:503a9ea5cd8740a9f0e891",
  measurementId: "G-QSGCEMNFPY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Initialize Firestore
const db = getFirestore(app);

export { auth, db, googleProvider, app };