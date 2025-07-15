// Clase Vista: Muestra la informacion al usuario
class MenuVista {
    mostrarPlatos(platos: Plato[]): void {
        console.log("Menú del Restaurante:");
        platos.forEach((plato, i) => {
            console.log(`${i + 1}. ${plato.getNombre()} - $${plato.getPrecio()}`);
        });
    }

    mostrarMensaje(msg: string): void {
        console.log(` ${msg}`);
    }
}