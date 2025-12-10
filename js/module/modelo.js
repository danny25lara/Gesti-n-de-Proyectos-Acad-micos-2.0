// Clase que define la estructura de un Proyecto
export class Proyecto {
    constructor(nombre, integrantes, fecha, avance) {
        // Generamos un ID único para cada proyecto basado en la fecha actual para poder calcular el progreso estimado
        this.id = Date.now(); 
        this.nombre = nombre;
        this.integrantes = integrantes;
        this.fechaEntrega = fecha;
        this.avance = parseInt(avance);
        this.informe = "";
        this.archivos = [];
    }
}