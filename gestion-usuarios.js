document.addEventListener('DOMContentLoaded', () => {
    const user = window.CURRENT_USER;
    const isAdministrador = user.role === 'ADMINISTRADOR';
    const isSupervisor = user.role === 'SUPERVISOR';
    const usuarioForm = document.getElementById('usuarioForm');
    const userFormCard = document.getElementById('userFormCard');
    const tableBody = document.getElementById('usuariosTableBody');
    const btnSubmit = document.getElementById('btnSubmit');

    let isEditing = false;
    let currentUserId = null;

    // RBAC: Ocultar el formulario si no es Admin o Supervisor
    if (user.permissions.some(p => p.startsWith('gestion-usuarios')) === false) {
        userFormCard.style.display = 'none';
        return; 
    }
    
    // RBAC: Restricciones específicas para Supervisor
    if (isSupervisor) {
        // El Supervisor solo puede ver el listado y cambiar estado a GUARDIA
        document.getElementById('rol').disabled = true; // No puede cambiar roles
        // Ocultar botones de crear/eliminar si es Supervisor (solo puede cambiar estado)
        btnSubmit.textContent = 'Guardar Cambios';
    }


    function loadUsers() {
        const users = window.getStoredData('users');
        tableBody.innerHTML = '';

        users.forEach(u => {
            const row = tableBody.insertRow();
            
            const estadoBadge = u.estado === 'Activo' ? 
                                `<span class="badge badge-success">Activo</span>` : 
                                `<span class="badge badge-danger">Inactivo</span>`;
            
            let accionesHTML = '';
            
            if (isAdministrador) {
                // Admin: Acciones completas
                accionesHTML = `
                    <button class="btn btn-secondary btn-sm" onclick="editUser(${u.id})">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteUser(${u.id})">Eliminar</button>
                `;
            } else if (isSupervisor) {
                 // Supervisor: Solo puede editar (cambiar estado) de Guardias
                if (u.rol === 'GUARDIA' && u.id !== user.userId) { // No se puede editar a sí mismo
                    accionesHTML = `
                        <button class="btn btn-secondary btn-sm" onclick="editUser(${u.id})">Cambiar Estado</button>
                    `;
                } else if (u.id === user.userId) {
                    accionesHTML = `<span class="badge badge-warning">Tu cuenta</span>`;
                } else {
                    accionesHTML = 'Sin Permiso';
                }
            } else {
                accionesHTML = 'N/A';
            }

            row.innerHTML = `
                <td>${u.id}</td>
                <td>${u.cedula}</td>
                <td>${u.email}</td>
                <td>${u.rol}</td>
                <td>${estadoBadge}</td>
                <td>${u.lastLogin || 'Nunca'}</td>
                <td>${accionesHTML}</td>
            `;
        });
    }

    usuarioForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const data = {
            cedula: document.getElementById('cedula').value.trim(),
            nombre: document.getElementById('nombre').value.trim(),
            email: document.getElementById('email').value.trim(),
            rol: document.getElementById('rol').value,
            estado: document.getElementById('estado').value,
            password: document.getElementById('password').value,
        };

        let users = window.getStoredData('users');
        
        // RBAC: Validaciones de edición/creación para Supervisor
        if (isSupervisor && !isEditing) {
            window.showNotification('Error: Los Supervisores no tienen permiso para crear nuevos usuarios.', 'error');
            return;
        }

        if (isSupervisor && isEditing) {
            const existingUser = users.find(u => u.id === currentUserId);
            if (existingUser.rol !== 'GUARDIA') {
                 window.showNotification('Error: Los Supervisores solo pueden cambiar el estado de los Guardias.', 'error');
                 return;
            }
        }
        
        if (isEditing) {
            // Lógica de Edición
            const index = users.findIndex(u => u.id === currentUserId);
            if (index !== -1) {
                users[index] = {
                    ...users[index],
                    cedula: data.cedula,
                    nombre: data.nombre,
                    email: data.email,
                    estado: data.estado,
                    rol: isAdministrador ? data.rol : users[index].rol, // Supervisor no puede cambiar rol
                };
                if (data.password) users[index].password = data.password;

                window.setStoredData('users', users);
                window.showNotification(`Usuario ${data.nombre} actualizado.`, 'success');
            }
        } else {
            // Lógica de Creación (Solo Admin)
            if (!isAdministrador) return; // Doble check
            
            if (!data.password) {
                window.showNotification('La contraseña es obligatoria para un nuevo usuario.', 'error');
                return;
            }
            
            const newUser = {
                ...data,
                id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
                usuario: data.email.split('@')[0],
                lastLogin: null
            };
            delete newUser.password; // La contraseña se guarda sin cifrar en este ejemplo

            users.push(newUser);
            window.setStoredData('users', users);
            window.showNotification(`Usuario ${data.nombre} creado.`, 'success');
        }

        resetForm();
        loadUsers();
    });

    window.editUser = function(id) {
        const users = window.getStoredData('users');
        const userToEdit = users.find(u => u.id === id);

        if (userToEdit) {
            // RBAC: Bloquear edición completa para Supervisor
            if (isSupervisor && userToEdit.rol !== 'GUARDIA') {
                 window.showNotification('El Supervisor solo puede modificar usuarios con rol GUARDIA.', 'error');
                 return;
            }

            isEditing = true;
            currentUserId = id;
            document.getElementById('usuarioId').value = id;
            
            document.getElementById('cedula').value = userToEdit.cedula;
            document.getElementById('nombre').value = userToEdit.nombre;
            document.getElementById('email').value = userToEdit.email;
            document.getElementById('rol').value = userToEdit.rol;
            document.getElementById('estado').value = userToEdit.estado;
            document.getElementById('password').value = ''; 
            
            btnSubmit.textContent = 'Guardar Cambios';
            btnSubmit.classList.remove('btn-primary');
            btnSubmit.classList.add('btn-success');
        }
    };
    
    window.deleteUser = function(id) {
        if (!isAdministrador) return; // RBAC: Solo Admin puede eliminar
        if (id === user.userId) {
             window.showNotification('No puedes eliminar tu propia cuenta.', 'error');
             return;
        }

        if (confirm('¿Está seguro de que desea eliminar este usuario? Esta acción es irreversible.')) {
            let users = window.getStoredData('users').filter(u => u.id !== id);
            window.setStoredData('users', users);
            window.showNotification('Usuario eliminado permanentemente.', 'success');
            loadUsers();
        }
    };

    function resetForm() {
        usuarioForm.reset();
        isEditing = false;
        currentUserId = null;
        document.getElementById('usuarioId').value = '';
        btnSubmit.textContent = 'Registrar Usuario';
        btnSubmit.classList.remove('btn-success');
        btnSubmit.classList.add('btn-primary');
    }
    
    document.getElementById('btnLimpiar').addEventListener('click', resetForm);
    loadUsers();
});