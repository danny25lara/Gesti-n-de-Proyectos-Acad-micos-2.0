// js/modules/datos.js

import { db, auth } from './firebase.js'; // Asegúrate de que firebase.js esté en la misma carpeta
import { 
    collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
    createUserWithEmailAndPassword, signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// === 1. USUARIOS ===

export async function registrarUsuario(email, password, quiereSerAdmin) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Comprobamos si ya hay admin
        const usuariosRef = collection(db, "usuarios");
        const q = query(usuariosRef, where("rol", "==", "admin"));
        const snapshot = await getDocs(q);
        
        let rolAsignado = 'usuario';
        if (snapshot.empty && quiereSerAdmin) {
            rolAsignado = 'admin';
        }

        await addDoc(collection(db, "usuarios"), {
            uid: user.uid,
            email: email,
            rol: rolAsignado
        });

        return { exito: true };
    } catch (error) {
        console.error("Error registro:", error);
        let mensaje = "Error al registrar.";
        if(error.code === 'auth/email-already-in-use') mensaje = "El correo ya está registrado.";
        if(error.code === 'auth/weak-password') mensaje = "La contraseña es muy débil (mínimo 6 caracteres).";
        return { exito: false, msj: mensaje };
    }
}

export async function validarLogin(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Buscamos rol
        const usuariosRef = collection(db, "usuarios");
        const q = query(usuariosRef, where("uid", "==", user.uid));
        const snapshot = await getDocs(q);

        let rol = 'usuario';
        snapshot.forEach(doc => { rol = doc.data().rol; });

        return { exito: true, rol: rol };
    } catch (error) {
        console.error("Error login:", error);
        return { exito: false };
    }
}

export async function existeAdminRegistrado() {
    const q = query(collection(db, "usuarios"), where("rol", "==", "admin"));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
}

// === 2. PROYECTOS ===

export async function obtenerProyectos() {
    const proyectos = [];
    const querySnapshot = await getDocs(collection(db, "proyectos"));
    querySnapshot.forEach((doc) => {
        proyectos.push({ id: doc.id, ...doc.data() });
    });
    return proyectos;
}

export async function guardarProyecto(nombre, integrantes, fechaEntrega, avance) {
    try {
        await addDoc(collection(db, "proyectos"), {
            nombre: nombre,
            integrantes: integrantes,
            fechaEntrega: fechaEntrega,
            avance: parseInt(avance),
            informe: "",
            archivos: [],
            fechaCreacion: new Date().toISOString()
        });
        return true;
    } catch (e) {
        console.error("Error guardando:", e);
        return false;
    }
}

export async function guardarInformeProyecto(idProyecto, textoInforme) {
    const proyectoRef = doc(db, "proyectos", idProyecto);
    await updateDoc(proyectoRef, { informe: textoInforme });
}

export async function actualizarAvanceProyecto(idProyecto, nuevoAvance) {
    const proyectoRef = doc(db, "proyectos", idProyecto);
    await updateDoc(proyectoRef, { avance: parseInt(nuevoAvance) });
}

export async function eliminarProyectoPorId(idProyecto) {
    await deleteDoc(doc(db, "proyectos", idProyecto));
}

// === 3. ARCHIVOS ===

export async function subirArchivoAProyecto(idProyecto, nombre, tipo, base64) {
    try {
        const lista = await obtenerProyectos();
        const proyecto = lista.find(p => p.id === idProyecto);
        
        if(proyecto) {
            const nuevosArchivos = proyecto.archivos || [];
            nuevosArchivos.push({
                id: Date.now(),
                nombre: nombre,
                tipo: tipo,
                datos: base64,
                fecha: new Date().toLocaleDateString()
            });

            const proyectoRef = doc(db, "proyectos", idProyecto);
            await updateDoc(proyectoRef, { archivos: nuevosArchivos });
            return true;
        }
        return false;
    } catch (e) {
        console.error(e);
        return false;
    }
}

export async function eliminarArchivoDeProyecto(idProyecto, idArchivo) {
    const lista = await obtenerProyectos();
    const proyecto = lista.find(p => p.id === idProyecto);

    if(proyecto && proyecto.archivos) {
        const archivosFiltrados = proyecto.archivos.filter(a => a.id !== idArchivo);
        const proyectoRef = doc(db, "proyectos", idProyecto);
        await updateDoc(proyectoRef, { archivos: archivosFiltrados });
    }
}