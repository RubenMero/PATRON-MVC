// Clase Vista: Muestra la informacion al usuario
var MenuVista = /** @class */ (function () {
    function MenuVista() {
    }
    MenuVista.prototype.mostrarPlatos = function (platos) {
        console.log("Menú del Restaurante:");
        platos.forEach(function (plato, i) {
            console.log("".concat(i + 1, ". ").concat(plato.getNombre(), " - $").concat(plato.getPrecio()));
        });
    };
    MenuVista.prototype.mostrarMensaje = function (msg) {
        console.log(" ".concat(msg));
    };
    return MenuVista;
}());
