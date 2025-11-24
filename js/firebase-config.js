// ========== FIREBASE CONFIGURATION (v9 Modular SDK) ==========

// IMPORTANTE: Reemplaza estos valores con tus credenciales de Firebase
// Obtén estos valores desde: Firebase Console > Project Settings > General > Your apps

const firebaseConfig = {
    apiKey: "TU_API_KEY_AQUI",
    authDomain: "TU_PROJECT_ID.firebaseapp.com",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_PROJECT_ID.appspot.com",
    messagingSenderId: "TU_MESSAGING_SENDER_ID",
    appId: "TU_APP_ID"
};

// Inicializar Firebase App
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Exportar funciones de Firestore para uso en otros archivos
export { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    setDoc, 
    updateDoc, 
    addDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    arrayUnion,
    arrayRemove,
    increment,
    runTransaction,
    writeBatch
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Exportar funciones de Auth
export {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Exportar funciones de Storage
export {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

console.log('✅ Firebase configurado correctamente');

