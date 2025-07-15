// Clase Controlador: Maneja la lógica del sistema
var MenuControlador = /** @class */ (function () {
    function MenuControlador(vista) {
        this.platos = [];
        this.vista = vista;
    }
    MenuControlador.prototype.agregarPlato = function (nombre, precio) {
        var nuevoPlato = new Plato(nombre, precio);
        this.platos.push(nuevoPlato);
        this.vista.mostrarMensaje("Plato agregado correctamnete.");
    };
    MenuControlador.prototype.eliminarPlato = function (nombre) {
        this.platos = this.platos.filter(function (plato) { return plato.getNombre() !== nombre; });
        this.vista.mostrarMensaje("Plato ".concat(nombre, " eliminado."));
    };
    MenuControlador.prototype.cambiarPrecio = function (nombre, nuevoPrecio) {
        var plato = this.platos.find(function (plato) { return plato.getNombre() === nombre; });
        if (plato) {
            plato.setPrecio(nuevoPrecio);
            this.vista.mostrarMensaje("Precio del plato ".concat(nombre, " actualizado a $").concat(nuevoPrecio, "."));
        }
        else {
            this.vista.mostrarMensaje("Plato ".concat(nombre, " no encontrado."));
        }
    };
    MenuControlador.prototype.mostrarMenu = function () {
        this.vista.mostrarPlatos(this.platos);
    };
    return MenuControlador;
}());
