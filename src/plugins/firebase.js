import firebase from "firebase/app";
import "firebase/firestore";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBayIvEXj1oWOo3ImNBaytEMqYNQJnG8Aw",
  authDomain: "pm-system-a2ac8.firebaseapp.com",
  projectId: "pm-system-a2ac8",
  storageBucket: "pm-system-a2ac8.appspot.com",
  messagingSenderId: "666741091239",
  appId: "1:666741091239:web:461769cc92c22d17826482"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
// const db = firebase.firestore();

export const firestore = firebase.firestore();