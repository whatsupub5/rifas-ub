import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDoc, doc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDzXrkKgGciuNzMizcfg9PVQ-yQh6ddOME",
  authDomain: "rifas-ubia.firebaseapp.com",
  projectId: "rifas-ubia",
  storageBucket: "rifas-ubia.firebasestorage.app",
  messagingSenderId: "851775533448",
  appId: "1:851775533448:web:7415a96e8ca01457554a3d",
  measurementId: "G-QT7VNZ2MRY"
};

// Inicializar
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, collection, addDoc, getDoc, doc, updateDoc, arrayUnion };
