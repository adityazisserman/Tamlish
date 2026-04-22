// Importing functions from the SDKs
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js';
import { getAuth, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, updateEmail, updatePassword, sendPasswordResetEmail, connectAuthEmulator } from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js';
import { getFirestore, collection, doc, getDoc, setDoc, addDoc, getDocs, serverTimestamp, connectFirestoreEmulator } from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js';

// https://firebase.google.com/docs/web/setup#available-libraries

// web app's Firebase configuration

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""  
};

// Initializing Firebase
const app = initializeApp(firebaseConfig);

// Initializing Firebase Authentication and getting a reference to the service
export const auth = getAuth(app);

// Initializing Cloud Firestore and getting a reference to the service
export const db = getFirestore(app);

// emulators for local dev
if (location.hostname === '127.0.0.1' || location.hostname === 'localhost') {
    console.log('connecting to emulators');
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
}

// Exporting functions
export { signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, updateEmail, collection, doc, getDoc, setDoc, addDoc, updatePassword, getDocs, serverTimestamp, sendPasswordResetEmail }


