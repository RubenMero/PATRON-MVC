// Clase Modelo: Representa un plato con nombre y precio 
export class Plato {
    private nombre: string;
    private precio: number;

    // Constructor
    constructor(nombre: string, precio: number) {
        this.nombre = nombre;
        this.precio = precio;
    }
    getNombre(): string {
        return this.nombre;
    }
    getPrecio(): number {
        return this.precio;
    }

    setNombre(nuevoNombre: string): void {
        this.nombre = nuevoNombre;
    }
    setPrecio(nuevoPrecio: number): void {
        this.precio = nuevoPrecio;
    }
}