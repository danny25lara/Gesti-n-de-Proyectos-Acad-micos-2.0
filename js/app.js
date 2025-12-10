// js/app.js

import { renderizarTabla } from './views/vistaReporte.js'; // Asegúrate de tener la carpeta 'vistas'
import { mostrarAlerta } from './module/utilidades.js';    // Asegúrate de tener la carpeta 'modules'
import { 
    validarLogin,
    registrarUsuario,
    existeAdminRegistrado,
    guardarProyecto,
    obtenerProyectos,
    guardarInformeProyecto
} from './module/datos.js';

// ELEMENTOS DOM - LANDING & AUTH
const contenedorLanding = document.getElementById('contenedorLanding');
const seccionAuth = document.getElementById('seccionAuth');
const btnIrAlLogin = document.getElementById('btnIrAlLogin');
const btnEmpezarAhora = document.getElementById('btnEmpezarAhora');
const btnVolverLanding = document.getElementById('btnVolverLanding');

// ELEMENTOS DOM - APP
const aplicacionPrincipal = document.getElementById('aplicacionPrincipal');
const coheteHero = document.querySelector('.icono-hero'); // Dentro de seccionAuth

// FORMULARIOS AUTH
const formLogin = document.getElementById('formLogin');
const formRegistro = document.getElementById('formRegistro');
const linkIrRegistro = document.getElementById('irARegistro');
const linkIrLogin = document.getElementById('irALogin');
const inputUser = document.getElementById('inputUsuario');
const inputPass = document.getElementById('inputPassword');
const btnLogin = document.getElementById('btnLogin');
const regEmail = document.getElementById('regEmail');
const regPass = document.getElementById('regPass');
const checkAdmin = document.getElementById('checkEsAdmin');
const btnRegistrar = document.getElementById('btnRegistrar');
const infoAdmin = document.getElementById('infoAdmin');

// NAVEGACIÓN APP
const btnReporte = document.getElementById('btnVerReporte');
const btnRegistro = document.getElementById('btnVerRegistro');
const btnInformes = document.getElementById('btnVerInformes'); 
const btnLogout = document.getElementById('btnCerrarSesion'); 
const secReporte = document.getElementById('seccionReporte');
const secRegistro = document.getElementById('seccionRegistro');
const secInformes = document.getElementById('seccionInformes');

// OTROS
const selectProyectos = document.getElementById('selProyectoInforme');
const txtInforme = document.getElementById('txtCuerpoInforme');
const btnGuardarInf = document.getElementById('btnGuardarInforme');
const btnImprimir = document.getElementById('btnImprimir');
const formNuevoProyecto = document.getElementById('formularioProyecto');


// =======================================================
// 1. LÓGICA DE NAVEGACIÓN (LANDING <-> LOGIN)
// =======================================================

function mostrarLogin() {
    contenedorLanding.style.display = 'none';
    seccionAuth.classList.remove('oculto');
    seccionAuth.style.display = 'flex';
}

function volverALanding() {
    seccionAuth.classList.add('oculto');
    seccionAuth.style.display = 'none';
    contenedorLanding.style.display = 'block';
}

if(btnIrAlLogin) btnIrAlLogin.addEventListener('click', mostrarLogin);
if(btnEmpezarAhora) btnEmpezarAhora.addEventListener('click', mostrarLogin);
if(btnVolverLanding) btnVolverLanding.addEventListener('click', volverALanding);


// =======================================================
// 2. AUTENTICACIÓN
// =======================================================

// =======================================================
// CONFIGURACIÓN DE ÍCONOS SVG (DISEÑO PROFESIONAL)
// =======================================================

// 1. Código del Ícono "Ojo Abierto" (Ver)
const iconVer = `
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 20px; height: 20px;">
    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
</svg>
`;
// 2. Código del Ícono "Ojo Tachado" (Ocultar - Como tu imagen)
const iconOcultar = `
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 20px; height: 20px;">
    <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
</svg>
`;
// 3. Función Lógica
function configurarOjo(idInput, idIcono) {
    const input = document.getElementById(idInput);
    const icono = document.getElementById(idIcono);

    if (input && icono) {
        // Poner el ícono inicial (Ojo Tachado por defecto, o Abierto, según prefieras)
        // Usualmente las contraseñas inician ocultas, así que ponemos el ícono de "ver" para activarlo
        icono.innerHTML = iconVer; 

        icono.addEventListener('click', () => {
            if (input.type === "password") {
                input.type = "text"; // Mostrar texto
                icono.innerHTML = iconOcultar; // Cambiar a ojo tachado
            } else {
                input.type = "password"; // Ocultar texto
                icono.innerHTML = iconVer; // Cambiar a ojo normal
            }
        });
    }
}

// Inicializar
configurarOjo('inputPassword', 'ojoLogin');
configurarOjo('regPass', 'ojoRegistro');

// Cambiar entre Login y Registro
linkIrRegistro.addEventListener('click', async (e) => {
    e.preventDefault();
    formLogin.classList.add('oculto');
    formRegistro.classList.remove('oculto');
    
    // Consultar si hay admin
    const hayAdmin = await existeAdminRegistrado();
    if (hayAdmin) {
        checkAdmin.disabled = true;
        checkAdmin.checked = false;
        infoAdmin.style.display = 'block';
    } else {
        checkAdmin.disabled = false;
        infoAdmin.style.display = 'none';
    }
});

linkIrLogin.addEventListener('click', (e) => {
    e.preventDefault();
    formRegistro.classList.add('oculto');
    formLogin.classList.remove('oculto');
});

// Registrar
btnRegistrar.addEventListener('click', async () => {
    const email = regEmail.value.trim();
    const pass = regPass.value.trim();
    const quiereSerAdmin = checkAdmin.checked;

    if (!email || !pass) {
        mostrarAlerta("Por favor, llena todos los campos", true);
        return;
    }

    btnRegistrar.textContent = "Creando...";
    btnRegistrar.disabled = true;

    const resultado = await registrarUsuario(email, pass, quiereSerAdmin);

    btnRegistrar.textContent = "Crear Cuenta";
    btnRegistrar.disabled = false;

    if (resultado.exito) {
        mostrarAlerta("¡Registro Exitoso! ✅ Redirigiendo...", false);
        regEmail.value = "";
        regPass.value = "";
        checkAdmin.checked = false;
        
        setTimeout(() => {
            formRegistro.classList.add('oculto');
            formLogin.classList.remove('oculto');
            inputUser.value = email;
        }, 2000);
    } else {
        mostrarAlerta(resultado.msj, true);
    }
});

// Login
btnLogin.addEventListener('click', async function() {
    const user = inputUser.value.trim();
    const pass = inputPass.value.trim();

    if(!user || !pass) return;

    btnLogin.textContent = "Entrando...";
    btnLogin.disabled = true;

    const resultado = await validarLogin(user, pass);

    btnLogin.textContent = "Ingresar ➔";
    btnLogin.disabled = false;

    if (resultado.exito) {
        mostrarAlerta(`Bienvenido, ${resultado.rol.toUpperCase()}`, false);
        entrarAlSistema(resultado.rol);
    } else {
        mostrarAlerta("Credenciales incorrectas", true);
    }
});


// =======================================================
// 3. ENTRADA AL SISTEMA
// =======================================================

function entrarAlSistema(rol) {
    document.body.className = ''; 
    const elementosAdmin = document.querySelectorAll('nav .solo-admin');

    if (rol === 'usuario') {
        document.body.classList.add('rol-usuario');
        elementosAdmin.forEach(btn => btn.style.display = 'none');
    } else {
        document.body.classList.add('rol-admin');
        elementosAdmin.forEach(btn => btn.style.display = '');
    }

    // Animación
    if(coheteHero) coheteHero.classList.add('cohete-despegando');
    seccionAuth.classList.add('desaparecer'); // Ocultamos la sección de login

    setTimeout(() => {
        seccionAuth.style.display = 'none'; // Quitamos login del flujo
        
        // Mostramos App
        aplicacionPrincipal.classList.remove('app-oculta');
        aplicacionPrincipal.classList.add('mostrar-app-animado');
        
        renderizarTabla();
    }, 3000);
}

// =======================================================
// 4. FUNCIONES DE LA APP
// =======================================================

// Logout
btnLogout.addEventListener('click', () => {
    if(confirm("¿Cerrar sesión?")) location.reload();
});

// Navegación Interna
function cambiarVista(vista) {
    secReporte.classList.add('oculto');
    secRegistro.classList.add('oculto');
    secInformes.classList.add('oculto');
    btnReporte.classList.remove('activo');
    btnRegistro.classList.remove('activo');
    btnInformes.classList.remove('activo');

    if (vista === 'registro') {
        secRegistro.classList.remove('oculto');
        btnRegistro.classList.add('activo');
    } else if (vista === 'informes') {
        secInformes.classList.remove('oculto');
        btnInformes.classList.add('activo');
        cargarSelectProyectos();
    } else {
        secReporte.classList.remove('oculto');
        btnReporte.classList.add('activo');
        renderizarTabla();
    }
}
btnReporte.addEventListener('click', () => cambiarVista('reporte'));
btnRegistro.addEventListener('click', () => cambiarVista('registro'));
btnInformes.addEventListener('click', () => cambiarVista('informes'));


// Guardar Nuevo Proyecto
if(formNuevoProyecto) {
    formNuevoProyecto.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nombre = document.getElementById('txtNombre').value;
        const integrantes = document.getElementById('txtIntegrantes').value;
        const fecha = document.getElementById('txtFecha').value;
        const avance = document.getElementById('numAvance').value;
        const btnSubmit = formNuevoProyecto.querySelector('button');

        btnSubmit.textContent = "Guardando...";
        btnSubmit.disabled = true;

        const exito = await guardarProyecto(nombre, integrantes, fecha, avance);

        btnSubmit.textContent = "Guardar Proyecto";
        btnSubmit.disabled = false;

        if(exito) {
            mostrarAlerta("Proyecto guardado", false);
            formNuevoProyecto.reset();
            cambiarVista('reporte');
        } else {
            mostrarAlerta("Error al guardar", true);
        }
    });
}

// Informes
async function cargarSelectProyectos() {
    selectProyectos.innerHTML = '<option>Cargando...</option>';
    const proyectos = await obtenerProyectos();
    selectProyectos.innerHTML = '<option value="">-- Elija un proyecto --</option>';
    proyectos.forEach(p => {
        let option = document.createElement('option');
        option.value = p.id;
        option.textContent = p.nombre;       
        selectProyectos.appendChild(option);
    });
}

selectProyectos.addEventListener('change', async function() {
    const id = this.value;
    if (id) {
        const lista = await obtenerProyectos();
        const p = lista.find(proj => proj.id === id);
        if (p) txtInforme.value = p.informe || ""; 
    } else {
        txtInforme.value = "";
    }
});

btnGuardarInf.addEventListener('click', async function() {
    const id = selectProyectos.value;
    const texto = txtInforme.value;
    if (!id) { mostrarAlerta("Seleccione un proyecto", true); return; }
    
    btnGuardarInf.textContent = "Guardando...";
    await guardarInformeProyecto(id, texto);
    btnGuardarInf.textContent = "Guardar Informe";
    mostrarAlerta("Informe guardado", false);
    
    txtInforme.value = "";
    selectProyectos.value = "";
});

// Imprimir
if (btnImprimir) {
    btnImprimir.addEventListener('click', function() {
        // Asegúrate de tener <span id="fechaImpresion"> en tu HTML si quieres fecha
        const spanFecha = document.getElementById('fechaImpresion');
        if(spanFecha) spanFecha.textContent = new Date().toLocaleString();
        window.print();
    });
}