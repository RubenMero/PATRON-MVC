// Clase Controlador: Maneja la lógica del sistema
import { Plato } from './Plato';
import { MenuVista } from './MenuVista';

export class MenuControlador {
    private platos: Plato[] = [];
    private vista: MenuVista;

    constructor(vista: MenuVista) {
        this.vista = vista;
    }
    // Métodos para manejar la lógica del menú
    // Agregar un plato al menú
    public agregarPlato(p: Plato): void {
        this.platos.push(p);
        this.vista.mostrarMensaje(`Plato "${p.getNombre()}" agregado al menú.`);
    }
    // Eliminar un plato del menú
    public eliminarPlato(nombre: string): void {
        const index = this.platos.findIndex(plato => plato.getNombre() === nombre);
        if (index !== -1) {
            this.platos.splice(index, 1);
            this.vista.mostrarMensaje(`Plato "${nombre}" eliminado del menú.`);
        } else {
            this.vista.mostrarMensaje(`Plato "${nombre}" no encontrado.`);
        }
    }
    // Cambiar el precio de un plato
    public cambiarPrecio(nombre: string, nuevoPrecio: number): void {
        const plato = this.platos.find(plato => plato.getNombre() === nombre);
        if (plato) {
            plato.setPrecio(nuevoPrecio);
            this.vista.mostrarMensaje(`Precio del plato ${nombre} actualizado a $${nuevoPrecio}.`);
        } else {
            this.vista.mostrarMensaje(`Plato ${nombre} no encontrado.`);
        }
    }
    // Mostrar el menú actual
    public mostrarMenu(): void {
        this.vista.mostrarPlatos(this.platos);
    }
}