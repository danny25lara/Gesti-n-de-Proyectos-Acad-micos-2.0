// js/views/vistaRegistro.js
import { Proyecto } from '../module/modelo.js';
import { guardarProyectoEnMemoria } from '../module/datos.js';
import { mostrarAlerta } from '../module/utilidades.js';

export function inicializarRegistro() {
    let formulario = document.getElementById('formularioProyecto');

    formulario.addEventListener('submit', function(evento) {
        // Evitar que la página se recargue
        evento.preventDefault();

        // Obtener valores de los inputs
        let nombre = document.getElementById('txtNombre').value;
        let integrantes = document.getElementById('txtIntegrantes').value;
        let fecha = document.getElementById('txtFecha').value;
        let avance = document.getElementById('numAvance').value;

        // Validación básica
        if (avance < 0 || avance > 100) {
            mostrarAlerta("El avance debe ser entre 0 y 100", true);
            return; // Detener la función
        }

        // Crear el objeto proyecto
        let nuevoProyecto = new Proyecto(nombre, integrantes, fecha, avance);

        // Guardar
        guardarProyectoEnMemoria(nuevoProyecto);

        // Mensaje de éxito y limpiar campos
        mostrarAlerta("Proyecto registrado correctamente", false);
        formulario.reset();
    });
}
