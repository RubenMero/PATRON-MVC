document.addEventListener('DOMContentLoaded', () => {
    const user = window.CURRENT_USER;
    const isAdministrador = user.permissions.includes('vehiculos-full');
    const isRW = user.permissions.includes('vehiculos-rw'); // Supervisor
    const vehiculoForm = document.getElementById('vehiculoForm');
    const vehiculoFormCard = document.getElementById('vehiculoFormCard');
    const tableBody = document.getElementById('vehiculosTableBody');
    const btnSubmit = document.getElementById('btnSubmit');
    const thAcciones = document.getElementById('thAcciones');

    let isEditing = false;
    let currentVehiculoId = null;

    // RBAC: Ocultar formulario si el rol solo permite consulta (Guardia)
    if (!isAdministrador && !isRW) {
        if (vehiculoFormCard) vehiculoFormCard.style.display = 'none';
        if (thAcciones) thAcciones.style.display = 'none';
    }

    function loadVehiculos() {
        const vehiculos = window.getStoredData('vehiculos');
        tableBody.innerHTML = '';

        vehiculos.forEach(v => {
            const row = tableBody.insertRow();
            
            const estadoBadge = v.estado === 'Autorizado' ? 
                                `<span class="badge badge-success">Autorizado</span>` : 
                                `<span class="badge badge-danger">Suspendido</span>`;
            
            let accionesHTML = 'N/A';
            if (isAdministrador || isRW) {
                // Supervisor y Admin pueden editar/suspender
                accionesHTML = `
                    <button class="btn btn-secondary btn-sm" onclick="editVehiculo(${v.id})">Editar</button>
                `;
            }
            
            if (isAdministrador) {
                // Solo Admin puede eliminar permanentemente
                accionesHTML += `<button class="btn btn-danger btn-sm" onclick="deleteVehiculo(${v.id})">Eliminar</button>`;
            }
            
            row.innerHTML = `
                <td>${v.placa}</td>
                <td>${v.propietario}</td>
                <td>${v.tipoUsuario}</td>
                <td>${v.marca || ''} / ${v.modelo || ''}</td>
                <td>${estadoBadge}</td>
                <td style="${(!isAdministrador && !isRW) ? 'display: none;' : ''}">${accionesHTML}</td>
            `;
        });
    }

    vehiculoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const data = {
            placa: document.getElementById('placa').value.trim().toUpperCase(),
            propietario: document.getElementById('propietario').value.trim(),
            tipoUsuario: document.getElementById('tipoUsuario').value,
            marca: document.getElementById('marca').value.trim(),
            modelo: document.getElementById('modelo').value.trim(),
            estado: document.getElementById('estado').value,
        };

        if (!window.isValidPlaca(data.placa)) {
            window.showNotification('Placa inválida. Formato: XXX-123 o XXX-1234', 'error');
            return;
        }

        let vehiculos = window.getStoredData('vehiculos');
        
        if (isEditing) {
            // Lógica de Edición (Admin/Supervisor)
            const index = vehiculos.findIndex(v => v.id === currentVehiculoId);
            if (index !== -1) {
                vehiculos[index] = { ...vehiculos[index], ...data };
                window.setStoredData('vehiculos', vehiculos);
                window.showNotification(`Vehículo ${data.placa} actualizado con éxito.`, 'success');
            }
        } else {
            // Lógica de Creación (Admin/Supervisor)
            if (!isAdministrador && !isRW) return; // Doble check
            
            // Verificar placa duplicada
            if (vehiculos.some(v => v.placa === data.placa)) {
                window.showNotification('Error: Ya existe un vehículo con esa placa registrado.', 'error');
                return;
            }

            const newVehiculo = {
                ...data,
                id: vehiculos.length > 0 ? Math.max(...vehiculos.map(v => v.id)) + 1 : 1,
            };

            vehiculos.push(newVehiculo);
            window.setStoredData('vehiculos', vehiculos);
            window.showNotification(`Vehículo ${data.placa} registrado con éxito.`, 'success');
        }

        resetForm();
        loadVehiculos(); 
    });

    window.editVehiculo = function(id) {
        if (!isAdministrador && !isRW) return; // RBAC: Solo Admin/Supervisor
        const vehiculos = window.getStoredData('vehiculos');
        const vehiculoToEdit = vehiculos.find(v => v.id === id);

        if (vehiculoToEdit) {
            isEditing = true;
            currentVehiculoId = id;
            document.getElementById('vehiculoId').value = id;
            
            document.getElementById('placa').value = vehiculoToEdit.placa;
            document.getElementById('propietario').value = vehiculoToEdit.propietario;
            document.getElementById('tipoUsuario').value = vehiculoToEdit.tipoUsuario;
            document.getElementById('marca').value = vehiculoToEdit.marca;
            document.getElementById('modelo').value = vehiculoToEdit.modelo;
            document.getElementById('estado').value = vehiculoToEdit.estado;
            
            document.getElementById('placa').disabled = true; // No se puede cambiar la placa

            btnSubmit.textContent = 'Guardar Cambios';
            btnSubmit.classList.remove('btn-primary');
            btnSubmit.classList.add('btn-success');
        }
    };
    
    window.deleteVehiculo = function(id) {
        if (!isAdministrador) return; // RBAC: Solo Admin puede eliminar permanentemente
        
        if (confirm('¿Está seguro de que desea eliminar este vehículo permanentemente?')) {
            let vehiculos = window.getStoredData('vehiculos').filter(v => v.id !== id);
            window.setStoredData('vehiculos', vehiculos);
            window.showNotification('Vehículo eliminado permanentemente del registro.', 'success');
            loadVehiculos();
        }
    };

    function resetForm() {
        vehiculoForm.reset();
        isEditing = false;
        currentVehiculoId = null;
        document.getElementById('vehiculoId').value = '';
        document.getElementById('placa').disabled = false;
        btnSubmit.textContent = 'Registrar Vehículo';
        btnSubmit.classList.remove('btn-success');
        btnSubmit.classList.add('btn-primary');
    }

    document.getElementById('btnLimpiar').addEventListener('click', resetForm);
    loadVehiculos();
});