// Simulacion del sistema en funcionamiento
import { Plato } from "./Plato";
import { MenuVista } from "./MenuVista";
import { MenuControlador } from "./MenuControlador";

function main(): void {
    console.log("Bienvenido al Sistema de Restaurante - MVC");
    const vista = new MenuVista();
    const controlador = new MenuControlador(vista);

    //Demostracion del sistema
    vista.mostrarMensaje("Inicializando el sistema...");

    // Agregar algunos platos al menú
    const plato1 = new Plato("Ceviche", 4.50);
    const plato2 = new Plato("Arroz con pollo", 3.75);  
    const plato3 = new Plato("Hamburguesa", 5.00);
    const plato4 = new Plato("Pizza", 6.50);
    const plato5 = new Plato("Tacos", 4.25);

    // Agregar platos al controlador
    controlador.agregarPlato(plato1);
    controlador.agregarPlato(plato2);
    controlador.agregarPlato(plato3);
    controlador.agregarPlato(plato4);
    controlador.agregarPlato(plato5);

    // Mostrar el menú
    vista.mostrarMensaje("Platos disponibles:");
    controlador.mostrarMenu();

    // Cambiar el precio de un plato
    vista.mostrarMensaje("Actualizando el precio de un plato...");
    controlador.cambiarPrecio("Arroz con pollo", 4.00);

    // Eliminar un plato
    vista.mostrarMensaje("Eliminando un plato...");
    controlador.eliminarPlato("Tacos");

    // Mostrar el menú actualizado
    vista.mostrarMensaje("Menú actualizado:");
    controlador.mostrarMenu();
}
