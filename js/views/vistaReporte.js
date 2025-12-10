// js/vistas/vistaReporte.js
import { obtenerProyectos, eliminarProyectoPorId, actualizarAvanceProyecto, subirArchivoAProyecto, eliminarArchivoDeProyecto } from '../module/datos.js'; 
import { calcularEstadoProyecto, mostrarAlerta } from '../module/utilidades.js';

// --- REFERENCIAS A MODALES ---
const modal = document.getElementById('modalVisualizar');
const btnCerrar = document.getElementById('btnCerrarModal');
const tituloModal = document.getElementById('tituloModal');
const textoModal = document.getElementById('textoModal');

const modalArchivos = document.getElementById('modalArchivos');
const btnCerrarArchivos = document.getElementById('btnCerrarModalArchivos');
const tituloModalArchivos = document.getElementById('tituloModalArchivos');
const zonaSubida = document.getElementById('zonaSubidaAdmin');
const inputFile = document.getElementById('inputFileProyecto');
const btnSubir = document.getElementById('btnSubirArchivo');
const listaArchivosUI = document.getElementById('listaArchivosContainer');
const msgArchivo = document.getElementById('msgArchivo');

let idProyectoActual = null;

// Cierre de Modales
if (btnCerrar) btnCerrar.addEventListener('click', () => modal.classList.add('oculto'));
if (btnCerrarArchivos) btnCerrarArchivos.addEventListener('click', () => modalArchivos.classList.add('oculto'));
window.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('oculto');
    if (e.target === modalArchivos) modalArchivos.classList.add('oculto');
});

// --- FUNCIÓN PRINCIPAL (AHORA ES ASÍNCRONA: ASYNC) ---
export async function renderizarTabla() {
    let cuerpoTabla = document.getElementById('cuerpoTabla');
    
    // Feedback visual mientras carga
    cuerpoTabla.innerHTML = '<tr><td colspan="6" style="text-align:center;">🔄 Cargando datos...</td></tr>';

    try {
        // ESPERAMOS a que lleguen los datos de Google
        let listaProyectos = await obtenerProyectos();
        
        const esUsuarioInvitado = document.body.classList.contains('rol-usuario');
        cuerpoTabla.innerHTML = '';

        if (listaProyectos.length === 0) {
            cuerpoTabla.innerHTML = '<tr><td colspan="6" style="text-align:center;">No hay proyectos registrados aún.</td></tr>';
            return;
        }

        // Usamos FOR normal para recorrer
        for (let i = 0; i < listaProyectos.length; i++) {
            let proyecto = listaProyectos[i];
            let estado = calcularEstadoProyecto(proyecto.fechaEntrega, proyecto.avance);
            let fila = document.createElement('tr');

            const estiloOculto = esUsuarioInvitado ? 'style="display: none !important;"' : '';

            fila.innerHTML = `
                <td>${proyecto.nombre}</td>
                <td>${proyecto.integrantes}</td>
                <td>${proyecto.fechaEntrega}</td>
                <td><strong>${proyecto.avance}%</strong></td>
                <td><span class="etiqueta ${estado.clase}">${estado.texto}</span></td>
                
                <td class="columna-acciones" style="text-align: center;">
                    <button class="boton-accion boton-ver" id="btn-ver-${proyecto.id}" style="background-color: #f59e0b;">📄</button>
                    <button class="boton-accion" id="btn-archivos-${proyecto.id}" style="background-color: #3b82f6; color: white;">📎</button>
                    <button class="boton-accion boton-editar solo-admin" id="btn-editar-${proyecto.id}" ${estiloOculto}>✏️</button>
                    <button class="boton-accion boton-eliminar solo-admin" id="btn-borrar-${proyecto.id}" ${estiloOculto}>🗑️</button>
                </td>
            `;
            cuerpoTabla.appendChild(fila);

            // EVENTOS (Igual que antes pero llamando a funciones async)
            
            // 1. Ver Informe
            document.getElementById(`btn-ver-${proyecto.id}`).addEventListener('click', () => {
                tituloModal.textContent = proyecto.nombre;
                textoModal.textContent = (proyecto.informe && proyecto.informe.trim() !== "") ? proyecto.informe : "No hay informes.";
                modal.classList.remove('oculto');
            });

            // 2. Archivos
            document.getElementById(`btn-archivos-${proyecto.id}`).addEventListener('click', () => {
                abrirModalArchivos(proyecto, esUsuarioInvitado);
            });

            // 3. Editar (Async)
            document.getElementById(`btn-editar-${proyecto.id}`).addEventListener('click', async () => {
                let nuevo = prompt(`Nuevo porcentaje para "${proyecto.nombre}":`, proyecto.avance);
                if (nuevo !== null && nuevo !== "" && !isNaN(nuevo) && nuevo >= 0 && nuevo <= 100) {
                        await actualizarAvanceProyecto(proyecto.id, nuevo); // Esperar a la nube
                        renderizarTabla(); // Recargar tabla
                        mostrarAlerta("Progreso guardado", false);
                }
            });

            // 4. Borrar (Async)
            document.getElementById(`btn-borrar-${proyecto.id}`).addEventListener('click', async () => {
                if(confirm("¿Eliminar proyecto permanentemente?")) {
                    await eliminarProyectoPorId(proyecto.id); // Esperar a la nube
                    renderizarTabla();
                    mostrarAlerta("Proyecto eliminado", true);
                }
            });
        }
    } catch (error) {
        console.error(error);
        cuerpoTabla.innerHTML = '<tr><td colspan="6" style="color:red; text-align:center;">Error al cargar datos. Revisa tu conexión.</td></tr>';
    }
}

// --- GESTOR DE ARCHIVOS ---

async function abrirModalArchivos(proyectoInfo, esInvitado) {
    idProyectoActual = proyectoInfo.id;
    tituloModalArchivos.textContent = `Archivos: ${proyectoInfo.nombre}`;
    msgArchivo.textContent = "";
    inputFile.value = ""; 

    if (esInvitado) zonaSubida.style.display = 'none';
    else zonaSubida.style.display = 'block';

    listaArchivosUI.innerHTML = '<p style="text-align:center;">Cargando...</p>';
    
    // TRAER DATOS FRESCOS DE LA NUBE
    const lista = await obtenerProyectos();
    const proyFresco = lista.find(p => p.id === idProyectoActual);

    if (proyFresco) renderizarListaArchivos(proyFresco, esInvitado);
    else renderizarListaArchivos(proyectoInfo, esInvitado);

    modalArchivos.classList.remove('oculto');
}

function renderizarListaArchivos(proyecto, esInvitado) {
    listaArchivosUI.innerHTML = '';
    if (!proyecto.archivos || proyecto.archivos.length === 0) {
        listaArchivosUI.innerHTML = '<p style="color: #999; text-align:center; padding:10px;">Carpeta vacía 📂</p>';
        return;
    }

    proyecto.archivos.forEach(archivo => {
        let div = document.createElement('div');
        div.style.cssText = "display:flex; justify-content:space-between; align-items:center; background:#f8fafc; padding:10px; margin-bottom:5px; border-radius:6px; border:1px solid #e2e8f0;";
        
        let icono = "📄"; // Simplificado
        let btnBorrarHTML = esInvitado ? '' : `<button class="btn-borrar-archivo" data-id="${archivo.id}" style="border:none; background:none; cursor:pointer;">❌</button>`;

        div.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px; overflow:hidden;">
                <span>${icono}</span>
                <a href="${archivo.datos}" download="${archivo.nombre}" style="color:#2563eb; font-weight:bold; text-decoration:none;">${archivo.nombre}</a>
            </div>
            ${btnBorrarHTML}
        `;
        listaArchivosUI.appendChild(div);
    });

    if (!esInvitado) {
        document.querySelectorAll('.btn-borrar-archivo').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if(confirm("¿Borrar archivo?")) {
                    const idArchivo = parseInt(e.target.getAttribute('data-id'));
                    await eliminarArchivoDeProyecto(idProyectoActual, idArchivo); // Esperar
                    
                    // Refrescar
                    const lista = await obtenerProyectos();
                    const p = lista.find(proj => proj.id === idProyectoActual);
                    renderizarListaArchivos(p, false);
                }
            });
        });
    }
}

btnSubir.addEventListener('click', () => {
    const archivo = inputFile.files[0];
    if (!archivo) return;
    if (archivo.size > 1000000) { alert("Máximo 1MB"); return; }

    btnSubir.textContent = "Subiendo..."; // Feedback visual
    btnSubir.disabled = true;

    const reader = new FileReader();
    reader.onload = async function(e) {
        const base64Data = e.target.result;
        const exito = await subirArchivoAProyecto(idProyectoActual, archivo.name, archivo.type, base64Data);
        
        btnSubir.textContent = "Subir";
        btnSubir.disabled = false;

        if (exito) {
            msgArchivo.textContent = "✅ Subido.";
            msgArchivo.style.color = "green";
            inputFile.value = "";
            const lista = await obtenerProyectos();
            const p = lista.find(proj => proj.id === idProyectoActual);
            renderizarListaArchivos(p, false);
        } else {
            alert("Error al subir.");
        }
    };
    reader.readAsDataURL(archivo);
});