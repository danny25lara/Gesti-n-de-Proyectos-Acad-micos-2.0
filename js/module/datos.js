import { db, auth } from './firebase.js';
import { 
    collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
    createUserWithEmailAndPassword, signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// VARIABLE GLOBAL PARA SABER EN QUÉ EMPRESA ESTAMOS
let currentOrgId = null;

// =======================================================
// 1. GESTIÓN DE USUARIOS
// =======================================================

export async function registrarUsuario(email, password, orgName, quiereSerAdmin) {
    try {
        // Normalizamos el nombre de la org (todo mayúsculas y sin espacios extra)
        const orgId = orgName.trim().toUpperCase().replace(/\s+/g, '_');

        if(!orgId) return { exito: false, msj: "Falta el nombre de la organización." };

        // 1. Crear usuario en Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Verificar SI EN ESTA ORGANIZACIÓN ya hay admin
        // OJO: Filtramos por 'organizationId'
        const usuariosRef = collection(db, "usuarios");
        const q = query(
            usuariosRef, 
            where("organizationId", "==", orgId), 
            where("rol", "==", "admin")
        );
        const snapshot = await getDocs(q);
        
        let rolAsignado = 'usuario';
        // Si no hay nadie en ESTA empresa con rol admin, tú eres el primero
        if (snapshot.empty && quiereSerAdmin) {
            rolAsignado = 'admin';
        }

        // 3. Guardar usuario con su Organización vinculada
        await addDoc(collection(db, "usuarios"), {
            uid: user.uid,
            email: email,
            rol: rolAsignado,
            organizationId: orgId // <--- LA CLAVE DE TODO
        });

        return { exito: true };

    } catch (error) {
        console.error("Error registro:", error);
        let mensaje = "Error al registrar.";
        if(error.code === 'auth/email-already-in-use') mensaje = "El correo ya existe.";
        return { exito: false, msj: mensaje };
    }
}

export async function validarLogin(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        // Buscar datos del usuario para saber su Org y Rol
        const usuariosRef = collection(db, "usuarios");
        const q = query(usuariosRef, where("uid", "==", user.uid));
        const snapshot = await getDocs(q);
        let datosUsuario = null;
        snapshot.forEach(doc => { datosUsuario = doc.data(); });
        if (datosUsuario) {
            // GUARDAMOS LA ORG EN MEMORIA PARA USARLA LUEGO
            currentOrgId = datosUsuario.organizationId;
            return { exito: true, rol: datosUsuario.rol, org: datosUsuario.organizationId };
        }
        return { exito: false };
    } catch (error) {
        console.error("Error login:", error);
        return { exito: false };
    }
}

// Verificar si hay Admin PERO EN UNA ORG ESPECÍFICA
// (Esto se usará cuando el usuario escriba el nombre de la empresa en el registro)
export async function existeAdminEnOrganizacion(orgName) {
    if(!orgName) return false;
    const orgId = orgName.trim().toUpperCase().replace(/\s+/g, '_');
    
    const q = query(
        collection(db, "usuarios"), 
        where("organizationId", "==", orgId),
        where("rol", "==", "admin")
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
}

// =======================================================
// 2. GESTIÓN DE PROYECTOS (FILTRADOS POR EMPRESA)
// =======================================================
export async function obtenerProyectos() {
    if (!currentOrgId) return []; // Seguridad

    const proyectos = [];
    // FILTRO VITAL: Solo dame proyectos de MI empresa
    const q = query(collection(db, "proyectos"), where("organizationId", "==", currentOrgId));
    
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        proyectos.push({ id: doc.id, ...doc.data() });
    });
    return proyectos;
}

export async function guardarProyecto(nombre, integrantes, fechaEntrega, avance) {
    if (!currentOrgId) return false;
    try {
        await addDoc(collection(db, "proyectos"), {
            nombre: nombre,
            integrantes: integrantes,
            fechaEntrega: fechaEntrega,
            avance: parseInt(avance),
            informe: "",
            archivos: [],
            fechaCreacion: new Date().toISOString(),
            organizationId: currentOrgId // <--- SE GUARDA CON LA ETIQUETA DE LA EMPRESA
        });
        return true;
    } catch (e) {
        console.error("Error:", e);
        return false;
    }
}

// Las funciones de actualizar/eliminar solo necesitan el ID del documento,
// Firebase ya sabe cuál es. Pero por seguridad visual, el usuario solo vio
// los proyectos de su empresa gracias a 'obtenerProyectos', así que solo borrará los suyos.

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
// =======================================================
// 3. ARCHIVOS
// =======================================================
// (Sin cambios lógicos grandes, dependen de obtenerProyectos que ya está filtrado)

export async function subirArchivoAProyecto(idProyecto, nombre, tipo, base64) {
    try {
        // Reutilizamos obtenerProyectos que ya filtra por Org
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
    } catch (e) { return false; }
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

// Getter para saber la organización actual desde el frontend si hace falta
export function getOrganizacionActual() { return currentOrgId; }
