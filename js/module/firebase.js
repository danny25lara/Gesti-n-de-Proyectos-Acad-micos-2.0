// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCoe10X5SuSXNVlTI4zcaRSRC_u4z7rV-o",
  authDomain: "gestor-de-proyectos-academicos.firebaseapp.com",
  projectId: "gestor-de-proyectos-academicos",
  storageBucket: "gestor-de-proyectos-academicos.firebasestorage.app",
  messagingSenderId: "268011164638",
  appId: "1:268011164638:web:2eeb93c7cc4d12e74e834f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 4. Exportar las herramientas para usarlas en otros archivos
export const db = getFirestore(app); // Base de datos
export const auth = getAuth(app);    // Sistema de usuarios

