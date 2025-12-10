//module/firebase.js
// 1. Importamos las librerías desde la Nube (CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// 2. Tu Configuración (La que me diste)
const firebaseConfig = {
    apiKey: "AIzaSyCoe10X5SuSXNVlTI4zcaRSRC_u4z7rV-o",
    authDomain: "gestor-de-proyectos-academicos.firebaseapp.com",
    projectId: "gestor-de-proyectos-academicos",
    storageBucket: "gestor-de-proyectos-academicos.firebasestorage.app",
    messagingSenderId: "268011164638",
    appId: "1:268011164638:web:2eeb93c7cc4d12e74e834f"
};

// 3. Inicializar Firebase
const app = initializeApp(firebaseConfig);

// 4. Exportar las herramientas para usarlas en otros archivos
export const db = getFirestore(app); // Base de datos
export const auth = getAuth(app);    // Sistema de usuarios
