// js/module/utilidades.js
// Función para calcular si el proyecto está a tiempo o retrasado
export function calcularEstadoProyecto(fechaLimite, porcentaje) {
    let fechaActual = new Date();
    let fechaEntrega = new Date(fechaLimite);
    let avance = parseInt(porcentaje);

    // Lógica condicional (IF - ELSE)
    if (avance === 100) {
        return { texto: "Completado", clase: "estado-ok" };
    } 
    
    if (fechaActual > fechaEntrega) {
        return { texto: "Retrasado", clase: "estado-retraso" };
    } else {
        return { texto: "En Proceso", clase: "estado-pendiente" };
    }
}

// Función para mostrar mensajes en pantalla
export function mostrarAlerta(mensaje, esError = false) {
    const contenedor = document.getElementById('contenedorAlertas');
    
    const div = document.createElement('div');
    // Asignamos clases: 'alerta' base, y luego el color
    div.className = esError ? 'alerta alerta-error' : 'alerta alerta-exito';
    div.textContent = mensaje;
    // Animación de entrada
    div.style.animation = "slideInRight 0.5s forwards";
    contenedor.appendChild(div);
    // Eliminar a los 4 segundos
    setTimeout(() => {
        // Animación de salida (opcional, visualmente se va desvaneciendo)
        div.style.opacity = '0';
        setTimeout(() => div.remove(), 500); // Borrar del DOM
    }, 4000);
}
