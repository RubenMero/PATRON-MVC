// Clase Vista: Muestra la informacion al usuario (la interfaz de usuario)
import { Plato } from './Plato'; 

export class MenuVista {
    public mostrarPlatos(platos: Plato[]): void {
        console.log("Menú del Restaurante:");
        platos.forEach(plato=> {
            console.log(`- ${plato.getNombre()} : $${plato.getPrecio().toFixed(2)}`);
        });
    }

    public mostrarMensaje(msg: string): void {
        console.log(msg);
    }
}
