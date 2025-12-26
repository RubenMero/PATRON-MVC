document.addEventListener('DOMContentLoaded', () => {
    const user = window.CURRENT_USER;
    const isGuardia = user.role === 'GUARDIA';
    const reporteForm = document.getElementById('reporteForm');
    const groupFechaDesde = document.getElementById('groupFechaDesde');
    const groupFechaHasta = document.getElementById('groupFechaHasta');
    const reporteVisualizacion = document.getElementById('reporteVisualizacion');
    const reportExportButtons = document.getElementById('reportExportButtons');

    // RBAC: Ocultar filtros avanzados y botones de exportación para Guardia
    if (isGuardia) {
        // Ocultar filtros de fecha (Solo reportes del día actual)
        groupFechaDesde.style.display = 'none';
        groupFechaHasta.style.display = 'none';
        
        // Ocultar botones de exportación
        reportExportButtons.style.display = 'none';
    }

    reporteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const tipoReporte = document.getElementById('tipoReporte').value;
        let fechaDesde = document.getElementById('fechaDesde').value;
        let fechaHasta = document.getElementById('fechaHasta').value;
        
        const allIngresos = window.getStoredData('ingresos');
        const allVehiculos = window.getStoredData('vehiculos');

        // RBAC: Forzar fechas a "hoy" para el Guardia
        if (isGuardia) {
            fechaDesde = window.getTodayDateString();
            fechaHasta = window.getTodayDateString();
        } else {
             if (!fechaDesde || !fechaHasta) {
                 window.showNotification('Debe seleccionar el rango de fechas para el reporte.', 'error');
                 return;
             }
        }
        
        // Filtrar datos por rango de fechas
        const filteredData = allIngresos.filter(i => 
            i.fechaIngreso >= fechaDesde && i.fechaIngreso <= fechaHasta
        );
        
        let reportHTML = '';
        let reportTitle = `Reporte de ${tipoReporte} (${fechaDesde} a ${fechaHasta})`;

        switch (tipoReporte) {
            case 'ingresos':
                reportHTML = generateIngresosReport(filteredData);
                reportTitle = `Reporte de Ingresos y Salidas`;
                break;
            case 'usuarios':
                reportHTML = generateUsuariosReport(filteredData);
                reportTitle = `Estadísticas de Ingresos por Tipo de Usuario`;
                break;
            case 'permanencia':
                reportHTML = generatePermanenciaReport(filteredData);
                reportTitle = `Análisis de Tiempos de Permanencia`;
                break;
            case 'vehiculos':
                 if (isGuardia) {
                      window.showNotification('Acceso Denegado: Reporte de Vehículos Registrados (Catálogo) no disponible para Guardias.', 'error');
                      return;
                 }
                reportHTML = generateVehiculosReport(allVehiculos);
                reportTitle = `Listado Completo de Vehículos Autorizados`;
                break;
            default:
                reportHTML = '<p>Seleccione un tipo de reporte válido.</p>';
        }

        document.getElementById('tituloReporteVisual').textContent = reportTitle;
        document.getElementById('reportContent').innerHTML = reportHTML;
        reporteVisualizacion.style.display = 'block';
        
        if (isGuardia) {
            window.showNotification('Reporte básico generado (Solo del día actual).', 'success');
        } else {
            window.showNotification('Reporte generado con éxito.', 'success');
        }
    });
    
    // --- Funciones de Generación de Reportes (Simulación) ---

    function generateIngresosReport(data) {
        const total = data.length;
        const activos = data.filter(i => i.estado === 'ACTIVO').length;
        const suspendido = total - activos;
        
        // Mostrar tabla resumida de los primeros 10
        let tableHTML = `
            <p>Total de Registros en el Período: <strong>${total}</strong> (Activos: ${activos}, Supendido: ${suspendido})</p>
            <h4>Detalle de Movimientos:</h4>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Placa</th>
                        <th>Ingreso</th>
                        <th>Salida</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
        `;
        data.slice(0, 10).forEach(i => {
            tableHTML += `
                <tr>
                    <td>${i.placa}</td>
                    <td>${window.formatDate(new Date(i.ingresoTimestamp))}</td>
                    <td>${i.salidaTimestamp ? window.formatDate(new Date(i.salidaTimestamp)) : 'N/A'}</td>
                    <td>${i.estado === 'ACTIVO' ? 'Activo' : 'Suspendido'}</td>
                </tr>
            `;
        });
        tableHTML += '</tbody></table>';
        return tableHTML;
    }

    function generateUsuariosReport(data) {
        const counts = data.reduce((acc, i) => {
            acc[i.tipoUsuario] = (acc[i.tipoUsuario] || 0) + 1;
            return acc;
        }, {});
        
        let reportHTML = `<h4>Conteo de Ingresos por Tipo de Usuario:</h4><ul>`;
        for (const [key, value] of Object.entries(counts)) {
            reportHTML += `<li><strong>${key}:</strong> ${value} ingresos</li>`;
        }
        reportHTML += `</ul>`;
        return reportHTML;
    }
    
    function generatePermanenciaReport(data) {
        const closedEntries = data.filter(i => i.estado === 'INACTIVO');
        const avgMs = closedEntries.reduce((sum, i) => sum + (i.salidaTimestamp - i.ingresoTimestamp), 0) / closedEntries.length;
        const avgHours = isNaN(avgMs) ? 'N/A' : (avgMs / (1000 * 3600)).toFixed(2);
        
        return `<p>Total de Salidas en el Período: <strong>${closedEntries.length}</strong></p>
                <p>Tiempo de Permanencia Promedio: <strong>${avgHours} horas</strong></p>
                <p><i>(Este reporte requeriría lógica más avanzada para calcular medianas y máximos.)</i></p>`;
    }
    
    function generateVehiculosReport(data) {
        let tableHTML = `
            <p>Total de Vehículos Autorizados: <strong>${data.length}</strong></p>
            <h4>Listado Completo:</h4>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Placa</th>
                        <th>Propietario</th>
                        <th>Tipo Usuario</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
        `;
        data.forEach(v => {
            tableHTML += `
                <tr>
                    <td>${v.placa}</td>
                    <td>${v.propietario}</td>
                    <td>${v.tipoUsuario}</td>
                    <td>${v.estado}</td>
                </tr>
            `;
        });
        tableHTML += '</tbody></table>';
        return tableHTML;
    }
    
    // Función de descarga (Simulación)
    window.descargarReporte = function(format) {
         if (isGuardia) return; // Doble check RBAC
         window.showNotification(`Descargando reporte en formato ${format}...`, 'success');
    };
});