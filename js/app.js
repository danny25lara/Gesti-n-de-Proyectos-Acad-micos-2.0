// js/app.js - CÓDIGO COMPLETO Y CORREGIDO

import { renderizarTabla } from './views/vistaReporte.js';
import { mostrarAlerta } from './module/utilidades.js';
import { 
    validarLogin,
    registrarUsuario,
    existeAdminEnOrganizacion, 
    guardarProyecto,
    obtenerProyectos,
    guardarInformeProyecto
} from './module/datos.js';

// =======================================================
// 1. REFERENCIAS AL DOM (ELEMENTOS)
// =======================================================

// LANDING & AUTH
const contenedorLanding = document.getElementById('contenedorLanding');
const seccionAuth = document.getElementById('seccionAuth');
const btnIrAlLogin = document.getElementById('btnIrAlLogin');
const btnEmpezarAhora = document.getElementById('btnEmpezarAhora');
const btnVolverLanding = document.getElementById('btnVolverLanding');

// APP PRINCIPAL
const aplicacionPrincipal = document.getElementById('aplicacionPrincipal');
const coheteHero = document.querySelector('.icono-hero'); 

// FORMULARIOS DE AUTENTICACIÓN
const formLogin = document.getElementById('formLogin');
const formRegistro = document.getElementById('formRegistro');
const linkIrRegistro = document.getElementById('irARegistro');
const linkIrLogin = document.getElementById('irALogin');

// INPUTS
const inputUser = document.getElementById('inputUsuario');
const inputPass = document.getElementById('inputPassword');
const btnLogin = document.getElementById('btnLogin');

const regOrg = document.getElementById('regOrg'); // <--- EL NUEVO INPUT IMPORTANTE
const regEmail = document.getElementById('regEmail');
const regPass = document.getElementById('regPass');
const checkAdmin = document.getElementById('checkEsAdmin');
const btnRegistrar = document.getElementById('btnRegistrar');
const infoAdmin = document.getElementById('infoAdmin');

// NAVEGACIÓN DENTRO DE LA APP
const btnReporte = document.getElementById('btnVerReporte');
const btnRegistro = document.getElementById('btnVerRegistro');
const btnInformes = document.getElementById('btnVerInformes'); 
const btnLogout = document.getElementById('btnCerrarSesion'); 
const secReporte = document.getElementById('seccionReporte');
const secRegistro = document.getElementById('seccionRegistro');
const secInformes = document.getElementById('seccionInformes');

// OTROS ELEMENTOS
const selectProyectos = document.getElementById('selProyectoInforme');
const txtInforme = document.getElementById('txtCuerpoInforme');
const btnGuardarInf = document.getElementById('btnGuardarInforme');
const btnImprimir = document.getElementById('btnImprimir');
const fechaImpresion = document.getElementById('fechaImpresion');
const formNuevoProyecto = document.getElementById('formularioProyecto');


// =======================================================
// 2. LÓGICA DE NAVEGACIÓN (LANDING <-> LOGIN)
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
// 3. AUTENTICACIÓN MULTI-EMPRESA 🏢
// =======================================================

// CONFIGURACIÓN DEL OJITO (VER CONTRASEÑA)
function configurarOjo(idInput, idIcono) {
    const input = document.getElementById(idInput);
    const icono = document.getElementById(idIcono);
    if (input && icono) {
        // Iconos SVG
        const iconVer = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:20px"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`;
        const iconOcultar = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:20px"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>`;
        
        icono.innerHTML = iconVer;
        icono.addEventListener('click', () => {
            if (input.type === "password") {
                input.type = "text";
                icono.innerHTML = iconOcultar;
            } else {
                input.type = "password";
                icono.innerHTML = iconVer;
            }
        });
    }
}
configurarOjo('inputPassword', 'ojoLogin');
configurarOjo('regPass', 'ojoRegistro');

// CHECKBOX INTELIGENTE (VERIFICAR SI YA HAY LÍDER)
if(regOrg) {
    regOrg.addEventListener('input', async () => {
        const empresa = regOrg.value;
        if(empresa.length > 2) { 
            const hayAdmin = await existeAdminEnOrganizacion(empresa);
            if (hayAdmin) {
                checkAdmin.disabled = true;
                checkAdmin.checked = false;
                infoAdmin.style.display = 'block';
                infoAdmin.textContent = `⚠️ La empresa "${empresa}" ya tiene un líder.`;
            } else {
                checkAdmin.disabled = false;
                infoAdmin.style.display = 'none';
            }
        }
    });
}

// ALTERNAR ENTRE LOGIN Y REGISTRO
linkIrRegistro.addEventListener('click', (e) => {
    e.preventDefault();
    formLogin.classList.add('oculto');
    formRegistro.classList.remove('oculto');
});

linkIrLogin.addEventListener('click', (e) => {
    e.preventDefault();
    formRegistro.classList.add('oculto');
    formLogin.classList.remove('oculto');
});

// PROCESO DE REGISTRO
btnRegistrar.addEventListener('click', async () => {
    // Validamos que existan los inputs
    if (!regOrg) { alert("Error: Falta el campo de Organización en el HTML"); return; }
    
    const org = regOrg.value.trim(); 
    const email = regEmail.value.trim();
    const pass = regPass.value.trim();
    const quiereSerAdmin = checkAdmin.checked;

    if (!org || !email || !pass) {
        mostrarAlerta("Llena todos los campos (Empresa, Correo, Contraseña).", true);
        return;
    }

    if (pass.length < 6) {
        mostrarAlerta("La contraseña debe tener al menos 6 caracteres.", true);
        return;
    }

    btnRegistrar.textContent = "Creando...";
    btnRegistrar.disabled = true;

    // Llamamos a la base de datos
    const resultado = await registrarUsuario(email, pass, org, quiereSerAdmin);

    btnRegistrar.textContent = "Crear Cuenta ✨";
    btnRegistrar.disabled = false;

    if (resultado.exito) {
        mostrarAlerta("¡Registro Exitoso! ✅ Redirigiendo...", false);
        // Limpiar campos
        regEmail.value = "";
        regPass.value = "";
        regOrg.value = "";
        checkAdmin.checked = false;
        
        setTimeout(() => {
            formRegistro.classList.add('oculto');
            formLogin.classList.remove('oculto');
            inputUser.value = email;
        }, 2000);
    } else {
        // Mostramos el error real que viene de Firebase
        mostrarAlerta(resultado.msj, true); 
    }
});

// PROCESO DE LOGIN
btnLogin.addEventListener('click', async function() {
    const user = inputUser.value.trim();
    const pass = inputPass.value.trim();

    if(!user || !pass) {
        mostrarAlerta("Ingresa correo y contraseña.", true);
        return;
    }

    btnLogin.textContent = "Entrando...";
    btnLogin.disabled = true;

    const resultado = await validarLogin(user, pass);

    btnLogin.textContent = "Ingresar ➔";
    btnLogin.disabled = false;

    if (resultado.exito) {
        let orgTexto = resultado.org ? ` de ${resultado.org}` : "";
        mostrarAlerta(`Bienvenido, ${resultado.rol.toUpperCase()}${orgTexto}`, false);
        entrarAlSistema(resultado.rol);
    } else {
        mostrarAlerta("Credenciales incorrectas ❌", true);
    }
});


// =======================================================
// 4. TRANSICIÓN AL SISTEMA (ANIMACIÓN)
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

    if(coheteHero) coheteHero.classList.add('cohete-despegando');
    seccionAuth.classList.add('desaparecer');

    setTimeout(() => {
        seccionAuth.style.display = 'none'; 
        aplicacionPrincipal.classList.remove('app-oculta');
        aplicacionPrincipal.classList.add('mostrar-app-animado');
        renderizarTabla();
    }, 3000);
}


// =======================================================
// 5. FUNCIONALIDADES DE LA APP (DASHBOARD)
// =======================================================

// Logout
btnLogout.addEventListener('click', () => {
    if(confirm("¿Cerrar sesión?")) location.reload();
});

// Cambiar Vistas (Tablero, Nuevo Proyecto, Informes)
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
            mostrarAlerta("Proyecto guardado en la nube ☁️", false);
            formNuevoProyecto.reset();
            cambiarVista('reporte');
        } else {
            mostrarAlerta("Error al guardar.", true);
        }
    });
}

// Cargar Proyectos para Informes
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
    mostrarAlerta("Informe guardado ☁️", false);
    
    txtInforme.value = "";
    selectProyectos.value = "";
});

// Imprimir
if (btnImprimir) {
    btnImprimir.addEventListener('click', function() {
        const spanFecha = document.getElementById('fechaImpresion');
        if(spanFecha) spanFecha.textContent = new Date().toLocaleString();
        window.print();
    });
}
