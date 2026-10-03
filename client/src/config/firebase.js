import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// These should ideally be in .env but for the demo, 
// I'll leave them as placeholders that the user can fill.
const firebaseConfig = {
  apiKey: "AIzaSyBCT5I566QKVSeLMHjViR6dZR4ZSeZrjKU",
  authDomain: "codedna-76e18.firebaseapp.com",
  projectId: "codedna-76e18",
  storageBucket: "codedna-76e18.firebasestorage.app",
  messagingSenderId: "288011301370",
  appId: "1:288011301370:web:47bdc183fda40ff1fd3443",
  measurementId: "G-P0CFR5EVJE"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
