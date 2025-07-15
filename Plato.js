// Clase Modelo: Representa un plato del menú 
var Plato = /** @class */ (function () {
    function Plato(nombre, precio) {
        this.nombre = nombre;
        this.precio = precio;
    }
    Plato.prototype.getNombre = function () {
        return this.nombre;
    };
    Plato.prototype.getPrecio = function () {
        return this.precio;
    };
    Plato.prototype.setNombre = function (nuevoNombre) {
        this.nombre = nuevoNombre;
    };
    Plato.prototype.setPrecio = function (nuevoPrecio) {
        this.precio = nuevoPrecio;
    };
    return Plato;
}());
