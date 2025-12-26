let activeEntry = null;
let intervalPermanencia = null;

document.addEventListener('DOMContentLoaded', () => {
    // Esconder detalles y mensaje de error al inicio
    document.getElementById('detallesVehiculo').style.display = 'none';
    document.getElementById('sinResultados').style.display = 'none';
    document.getElementById('registroSalidaForm').addEventListener('submit', handleSalidaSubmit);
});

// Función para calcular y mostrar el tiempo de permanencia
function startPermanenciaCalculation(timestamp) {
    if (intervalPermanencia) clearInterval(intervalPermanencia);

    intervalPermanencia = setInterval(() => {
        const diffMs = Date.now() - timestamp;
        const diffSeconds = Math.floor(diffMs / 1000);
        
        const days = Math.floor(diffSeconds / (3600 * 24));
        const hours = Math.floor((diffSeconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((diffSeconds % 3600) / 60);
        const seconds = diffSeconds % 60;

        document.getElementById('tiempoPermanencia').textContent = 
            `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }, 1000);
}

window.buscarVehiculoSalida = function() {
    const buscarPlaca = document.getElementById('buscarPlaca').value.trim().toUpperCase();
    
    document.getElementById('detallesVehiculo').style.display = 'none';
    document.getElementById('sinResultados').style.display = 'none';
    if (intervalPermanencia) clearInterval(intervalPermanencia);
    activeEntry = null;

    if (!window.isValidPlaca(buscarPlaca)) {
        window.showNotification('Formato de Placa inválido.', 'error');
        return;
    }

    const entries = window.getActiveEntries();
    activeEntry = entries.find(i => i.placa === buscarPlaca);

    if (activeEntry) {
        document.getElementById('infoPlaca').textContent = activeEntry.placa;
        document.getElementById('infoTipo').textContent = activeEntry.tipoVehiculo;
        document.getElementById('infoID').textContent = activeEntry.idConductor;
        document.getElementById('infoHoraIngreso').textContent = activeEntry.horaIngreso;
        document.getElementById('infoFechaIngreso').textContent = activeEntry.fechaIngreso;
        
        // Mostrar detalles y empezar a calcular el tiempo
        document.getElementById('detallesVehiculo').style.display = 'block';
        startPermanenciaCalculation(activeEntry.ingresoTimestamp);
    } else {
        document.getElementById('sinResultados').style.display = 'block';
        window.showNotification(`Vehículo ${buscarPlaca} no encontrado en campus.`, 'warning');
    }
};

function handleSalidaSubmit(e) {
    e.preventDefault();

    if (!activeEntry) {
        window.showNotification('Primero debe buscar y seleccionar un vehículo activo.', 'error');
        return;
    }

    const idSalida = document.getElementById('idSalida').value.trim();

    // 1. Validación de ID (para garantizar que la salida sea autorizada)
    if (idSalida !== activeEntry.idConductor) {
        window.showNotification('Error: El ID ingresado no coincide con el conductor de ingreso.', 'error');
        document.getElementById('idSalida').focus();
        return;
    }

    // 2. Registrar Salida
    const ingresos = window.getStoredData('ingresos');
    const index = ingresos.findIndex(i => i.id === activeEntry.id);

    if (index !== -1) {
        const now = new Date();
        ingresos[index].fechaSalida = window.getTodayDateString();
        ingresos[index].horaSalida = now.toLocaleTimeString();
        ingresos[index].salidaTimestamp = now.getTime();
        ingresos[index].estado = 'INACTIVO';
        ingresos[index].permanencia = document.getElementById('tiempoPermanencia').textContent;

        window.setStoredData('ingresos', ingresos);
        window.showNotification(`Salida de ${activeEntry.placa} registrada. Permanencia: ${ingresos[index].permanencia}`, 'success');
        
        // Limpiar interfaz
        window.cancelarSalida();
    }
}

window.cancelarSalida = function() {
    document.getElementById('buscarPlaca').value = '';
    document.getElementById('registroSalidaForm').reset();
    document.getElementById('detallesVehiculo').style.display = 'none';
    document.getElementById('sinResultados').style.display = 'none';
    if (intervalPermanencia) clearInterval(intervalPermanencia);
    activeEntry = null;
};