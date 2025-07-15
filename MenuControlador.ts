// Clase Controlador: Maneja la lógica del sistema
class MenuControlador {
    private platos: Plato[];
    private vista: MenuVista;

    constructor(vista: MenuVista) {
        this.platos = [];
        this.vista = vista;
    }

    agregarPlato(nombre: string, precio: number): void {
        const nuevoPlato = new Plato(nombre, precio);
        this.platos.push(nuevoPlato);
        this.vista.mostrarMensaje(`Plato agregado correctamnete.`);
    }

    eliminarPlato(nombre: string): void {
        this.platos= this.platos.filter(plato => plato.getNombre() !== nombre);
        this.vista.mostrarMensaje(`Plato ${nombre} eliminado.`);
    }
    
    cambiarPrecio(nombre: string, nuevoPrecio: number): void {
        const plato = this.platos.find(plato => plato.getNombre() === nombre);
        if (plato) {
            plato.setPrecio(nuevoPrecio);
            this.vista.mostrarMensaje(`Precio del plato ${nombre} actualizado a $${nuevoPrecio}.`);
        } else {
            this.vista.mostrarMensaje(`Plato ${nombre} no encontrado.`);
        }
    }
    mostrarMenu(): void {
        this.vista.mostrarPlatos(this.platos);
    }
}