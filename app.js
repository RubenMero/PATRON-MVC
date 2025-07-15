// Simulacion del sistema en funcionamiento
var vista = new MenuVista();
var controlador = new MenuControlador(vista);
controlador.agregarPlato("Hamburguesa", 8.99);
controlador.agregarPlato("Pizza", 12.99);
controlador.mostrarMenu();
controlador.cambiarPrecio("Pizza", 10.99);
controlador.eliminarPlato("Hamburguesa");
controlador.mostrarMenu();
