document.addEventListener('DOMContentLoaded', () => {
    const ingresoForm = document.getElementById('ingresoForm');
    const tableBody = document.getElementById('tablaIngresos');
    
    function updateTime() {
        document.getElementById('horaActual').textContent = new Date().toLocaleTimeString();
    }
    setInterval(updateTime, 1000);
    updateTime();

    function loadLastIngresos() {
        const ingresos = window.getStoredData('ingresos');
        const sortedIngresos = ingresos
            .sort((a, b) => new Date(b.ingresoTimestamp) - new Date(a.ingresoTimestamp))
            .slice(0, 5);

        tableBody.innerHTML = '';

        if (sortedIngresos.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6">Aún no hay registros de ingreso.</td></tr>';
            return;
        }

        sortedIngresos.forEach(i => {
            const row = tableBody.insertRow();
            const autorizadoBadge = i.isRegistered ? 
                                    `<span class="badge badge-success">Autorizado/Suspendido</span>` : 
                                    `<span class="badge badge-warning">Autorizado</span>`;
                
            row.innerHTML = `
                <td>${i.horaIngreso}</td>
                <td>${i.placa}</td>
                <td>${i.tipoVehiculo}</td>
                <td><strong>${i.tipoUsuario}</strong></td>
                <td>${i.idConductor}</td>
                <td>${autorizadoBadge}</td>
            `;
        });
    }

    ingresoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const placa = document.getElementById('placa').value.trim().toUpperCase();
        const idConductor = document.getElementById('idConductor').value.trim();
        const tipoVehiculo = document.getElementById('tipoVehiculo').value;
        const tipoUsuario = document.getElementById('tipoUsuario').value;
        const observaciones = document.getElementById('observaciones').value.trim();

        if (!window.isValidPlaca(placa)) {
            window.showNotification('Placa inválida. Formato: XXX-123 o XXX-1234', 'error');
            return;
        }
        if (!window.isValidCedula(idConductor)) {
            window.showNotification('Cédula inválida. Debe tener 10 dígitos.', 'error');
            return;
        }

        if (window.getActiveEntries().length >= window.MAX_CAPACITY) {
            window.showNotification('Acceso Denegado. La capacidad máxima del campus ha sido alcanzada.', 'error');
            return;
        }
        
        if (window.getActiveEntries().some(i => i.placa === placa)) {
            window.showNotification(`Error: El vehículo con placa ${placa} ya tiene un registro de ingreso activo.`, 'error');
            return;
        }

        const vehiculos = window.getStoredData('vehiculos');
        const isRegistered = vehiculos.some(v => v.placa === placa && v.estado === 'Autorizado');
        
        if (!isRegistered && tipoUsuario !== 'Visitante') {
             window.showNotification('Advertencia: Vehículo no registrado o suspendido. Registre como Visitante.', 'warning');
        }

        const ingresos = window.getStoredData('ingresos');
        const now = new Date();
        const newEntry = {
            id: ingresos.length > 0 ? Math.max(...ingresos.map(i => i.id)) + 1 : 1,
            placa: placa,
            idConductor: idConductor,
            tipoVehiculo: tipoVehiculo,
            tipoUsuario: tipoUsuario,
            isRegistered: isRegistered,
            fechaIngreso: window.getTodayDateString(),
            horaIngreso: now.toLocaleTimeString(),
            ingresoTimestamp: now.getTime(),
            registradoPor: window.CURRENT_USER.username,
            observaciones: observaciones,
            estado: 'ACTIVO',
            fechaSalida: null,
            horaSalida: null,
            salidaTimestamp: null,
        };

        ingresos.push(newEntry);
        window.setStoredData('ingresos', ingresos);
        
        window.showNotification(`Ingreso de ${placa} registrado con éxito. Tipo Usuario: ${tipoUsuario}`, 'success');
        ingresoForm.reset();
        loadLastIngresos();
    });

    loadLastIngresos();
});