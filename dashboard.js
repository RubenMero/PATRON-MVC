document.addEventListener('DOMContentLoaded', () => {
    const today = window.getTodayDateString();

    function updateDashboard() {
        const ingresos = window.getStoredData('ingresos');
        
        const ingresosHoy = ingresos.filter(i => i.fechaIngreso === today);
        const vehiculosEnCampus = window.getActiveEntries();
        const salidasRegistradas = ingresosHoy.filter(i => i.estado === 'INACTIVO');
        const capacidadOcupada = vehiculosEnCampus.length;
        const ocupacionPercent = ((capacidadOcupada / window.MAX_CAPACITY) * 100).toFixed(1);

        document.getElementById('totalIngresos').textContent = ingresosHoy.length;
        document.getElementById('vehiculosEnCampus').textContent = capacidadOcupada;
        document.getElementById('salidasRegistradas').textContent = salidasRegistradas.length;
        document.getElementById('capacidadOcupada').textContent = `${ocupacionPercent}%`;
        document.getElementById('ocupacionDetalle').textContent = `${capacidadOcupada} / ${window.MAX_CAPACITY} espacios`;

        const ultimosMovimientos = ingresos
            .sort((a, b) => new Date(b.ingresoTimestamp) - new Date(a.ingresoTimestamp))
            .slice(0, 5);

        const tableBody = document.getElementById('ultimosMovimientosTable');
        tableBody.innerHTML = '';

        if (ultimosMovimientos.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4">No hay movimientos recientes.</td></tr>';
            return;
        }

        ultimosMovimientos.forEach(movimiento => {
            const row = tableBody.insertRow();
            const hora = movimiento.horaSalida ? movimiento.horaSalida : movimiento.horaIngreso;
            const estado = movimiento.estado === 'ACTIVO' ? 
                           `<span class="badge badge-success">Dentro</span>` : 
                           `<span class="badge badge-danger">Salió</span>`;
            
            row.innerHTML = `
                <td>${hora}</td>
                <td>${movimiento.placa}</td>
                <td>${movimiento.tipoVehiculo}</td>
                <td>${estado}</td>
            `;
        });
        
        const user = window.CURRENT_USER;
        if (user.role === 'GUARDIA') {
             const chartContainer = document.querySelector('.chart-container');
             if (chartContainer) chartContainer.style.display = 'none';
        }
    }

    updateDashboard();
    setInterval(updateDashboard, 60000); 
});